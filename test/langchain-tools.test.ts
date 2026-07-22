import { describe, expect, it } from "vitest";
import { z } from "zod";
import { TypeMcpDefinitionError } from "../src/errors.js";
import { type InstanceResolver, McpServer, McpTool } from "../src/index.js";
import { createLangChainTools } from "../src/langchain.js";

function methodContext(
	name: string,
	metadata: DecoratorMetadata,
): ClassMethodDecoratorContext {
	return {
		kind: "method",
		name,
		static: false,
		private: false,
		access: {
			has: () => true,
			get: () => () => undefined,
		},
		metadata,
		addInitializer: () => undefined,
	};
}

function classContext(
	name: string,
	metadata: DecoratorMetadata,
): ClassDecoratorContext {
	return {
		kind: "class",
		name,
		metadata,
		addInitializer: () => undefined,
	};
}

describe("LangChain tool adapter", () => {
	it("projects decorated tool metadata and invokes a string handler", async () => {
		class CatalogServer {
			public find(input: { readonly id: string }): string {
				return `product:${input.id}`;
			}
		}
		const metadata: DecoratorMetadata = {};
		McpTool({
			name: "find-product",
			description: "Finds a product by identifier.",
			input: z.object({ id: z.string() }),
		})(CatalogServer.prototype.find, methodContext("find", metadata));
		McpServer({ name: "catalog", version: "1.0.0" })(
			CatalogServer,
			classContext("CatalogServer", metadata),
		);

		const [tool] = await createLangChainTools(CatalogServer);

		expect(tool).toMatchObject({
			name: "find-product",
			description: "Finds a product by identifier.",
		});
		expect(tool?.schema).toBeDefined();
		await expect(tool?.invoke({ id: "sku-7" })).resolves.toBe("product:sku-7");
	});

	it("resolves a dependency-requiring server exactly once", async () => {
		class InjectedServer {
			public constructor(private readonly prefix: string) {}

			public details(input: { readonly id: number }): {
				readonly id: number;
				readonly label: string;
			} {
				return { id: input.id, label: `${this.prefix}-${input.id}` };
			}
		}
		const metadata: DecoratorMetadata = {};
		McpTool({ input: z.object({ id: z.number() }) })(
			InjectedServer.prototype.details,
			methodContext("details", metadata),
		);
		McpServer({ name: "injected", version: "1.0.0" })(
			InjectedServer,
			classContext("InjectedServer", metadata),
		);
		let resolveCount = 0;
		const resolver: InstanceResolver<InjectedServer> = {
			resolve: () => {
				resolveCount += 1;
				return new InjectedServer("record");
			},
		};

		const [tool] = await createLangChainTools(InjectedServer, { resolver });

		expect(resolveCount).toBe(1);
		await expect(tool?.invoke({ id: 7 })).resolves.toBe(
			'{"id":7,"label":"record-7"}',
		);
	});

	it("rejects invalid input before invoking the decorated method", async () => {
		let callCount = 0;
		class ValidatedServer {
			public run(input: { readonly count: number }): string {
				callCount += 1;
				return String(input.count);
			}
		}
		const metadata: DecoratorMetadata = {};
		McpTool({ input: z.object({ count: z.number() }) })(
			ValidatedServer.prototype.run,
			methodContext("run", metadata),
		);
		McpServer({ name: "validated", version: "1.0.0" })(
			ValidatedServer,
			classContext("ValidatedServer", metadata),
		);
		const [tool] = await createLangChainTools(ValidatedServer);

		await expect(tool?.invoke({ count: "invalid" })).rejects.toThrow();
		expect(callCount).toBe(0);
	});

	it("returns a fixed safe failure for handler and serialization failures", async () => {
		class UnsafeServer {
			public fail(_input: Record<string, never>): never {
				throw new Error("application-secret");
			}

			public cyclic(_input: Record<string, never>): object {
				const value: { self?: object } = {};
				value.self = value;
				return value;
			}

			public absent(_input: Record<string, never>): undefined {
				return undefined;
			}
		}
		const metadata: DecoratorMetadata = {};
		for (const methodName of ["fail", "cyclic", "absent"] as const) {
			McpTool({ input: z.object({}) })(
				UnsafeServer.prototype[methodName],
				methodContext(methodName, metadata),
			);
		}
		McpServer({ name: "unsafe", version: "1.0.0" })(
			UnsafeServer,
			classContext("UnsafeServer", metadata),
		);

		const tools = await createLangChainTools(UnsafeServer);
		const outputs = await Promise.all(tools.map((tool) => tool.invoke({})));

		expect(outputs).toEqual([
			"Tool execution failed",
			"Tool execution failed",
			"Tool execution failed",
		]);
		expect(JSON.stringify(outputs)).not.toContain("application-secret");
	});

	it("preserves existing definition errors", async () => {
		class MissingServer {}

		await expect(createLangChainTools(MissingServer)).rejects.toBeInstanceOf(
			TypeMcpDefinitionError,
		);
	});
});

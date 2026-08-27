import { Client } from "@modelcontextprotocol/client";
import {
	CallToolResultSchema,
	InMemoryTransport,
	ListToolsResultSchema,
} from "@modelcontextprotocol/server";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { createMcpServer, McpServer, McpTool } from "../src/index.js";

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

function classContext(metadata: DecoratorMetadata): ClassDecoratorContext {
	return {
		kind: "class",
		name: "CalculatorServer",
		metadata,
		addInitializer: () => undefined,
	};
}

describe("decorated tool compilation", () => {
	it("publishes modern tool metadata and validates declared structured output", async () => {
		class MetadataServer {
			public calculate(input: { value: number }): { readonly answer: unknown } {
				return { answer: input.value < 0 ? "invalid" : input.value * 2 };
			}
		}

		const metadata: DecoratorMetadata = {};
		McpTool({
			title: "Double a number",
			description: "Returns twice the supplied value.",
			input: z.object({ value: z.number() }),
			outputSchema: z.object({ answer: z.number() }),
			annotations: {
				readOnlyHint: true,
				idempotentHint: true,
				openWorldHint: false,
			},
			_meta: { owner: "catalog-team" },
		})(
			MetadataServer.prototype.calculate,
			methodContext("calculate", metadata),
		);
		McpServer({ name: "metadata", version: "1.0.0" })(
			MetadataServer,
			classContext(metadata),
		);

		const server = await createMcpServer(MetadataServer);
		const client = new Client({ name: "test-client", version: "1.0.0" });
		const [clientTransport, serverTransport] =
			InMemoryTransport.createLinkedPair();
		await Promise.all([
			client.connect(clientTransport),
			server.connect(serverTransport),
		]);

		const tools = await client.request(
			{ method: "tools/list" },
			ListToolsResultSchema,
		);
		const valid = await client.request(
			{
				method: "tools/call",
				params: { name: "calculate", arguments: { value: 4 } },
			},
			CallToolResultSchema,
		);
		const invalid = await client.request(
			{
				method: "tools/call",
				params: { name: "calculate", arguments: { value: -1 } },
			},
			CallToolResultSchema,
		);

		expect(tools.tools).toContainEqual(
			expect.objectContaining({
				name: "calculate",
				title: "Double a number",
				annotations: {
					readOnlyHint: true,
					idempotentHint: true,
					openWorldHint: false,
				},
				_meta: { owner: "catalog-team" },
				outputSchema: expect.objectContaining({
					type: "object",
					required: ["answer"],
				}),
			}),
		);
		expect(valid).toMatchObject({
			content: [{ type: "text", text: '{"answer":8}' }],
			structuredContent: { answer: 8 },
		});
		expect(invalid.isError).toBe(true);

		await Promise.all([client.close(), server.close()]);
	});

	it("lists a decorated tool and invokes it with validated input", async () => {
		let addCallCount = 0;

		class CalculatorServer {
			public add(input: { left: number; right: number }): string {
				addCallCount += 1;
				return String(input.left + input.right);
			}
		}

		const metadata: DecoratorMetadata = {};
		McpTool({
			description: "Adds two numbers.",
			input: z.object({ left: z.number(), right: z.number() }),
		})(CalculatorServer.prototype.add, methodContext("add", metadata));
		McpServer({ name: "calculator", version: "1.0.0" })(
			CalculatorServer,
			classContext(metadata),
		);

		const server = await createMcpServer(CalculatorServer);
		const client = new Client({ name: "test-client", version: "1.0.0" });
		const [clientTransport, serverTransport] =
			InMemoryTransport.createLinkedPair();
		await Promise.all([
			client.connect(clientTransport),
			server.connect(serverTransport),
		]);

		const tools = await client.request(
			{ method: "tools/list" },
			ListToolsResultSchema,
		);
		const result = await client.request(
			{
				method: "tools/call",
				params: { name: "add", arguments: { left: 2, right: 3 } },
			},
			CallToolResultSchema,
		);

		const invalidResult = await client.request(
			{
				method: "tools/call",
				params: { name: "add", arguments: { left: "not-a-number", right: 3 } },
			},
			CallToolResultSchema,
		);

		expect(tools.tools).toContainEqual(
			expect.objectContaining({
				name: "add",
				description: "Adds two numbers.",
			}),
		);
		expect(result.content).toEqual([{ type: "text", text: "5" }]);
		expect(addCallCount).toBe(1);
		expect(invalidResult.isError).toBe(true);
		expect(addCallCount).toBe(1);
		expect(invalidResult.content[0]).toMatchObject({ type: "text" });

		await Promise.all([client.close(), server.close()]);
	});

	it("awaits asynchronous handlers and returns a safe error for thrown handlers", async () => {
		class AsyncServer {
			public async greet(input: { name: string }): Promise<string> {
				return `Hello, ${input.name}`;
			}

			public fail(_input: Record<string, never>): never {
				throw new Error("application secret must not be exposed");
			}
		}

		const metadata: DecoratorMetadata = {};
		McpTool({ input: z.object({ name: z.string() }) })(
			AsyncServer.prototype.greet,
			methodContext("greet", metadata),
		);
		McpTool({ input: z.object({}) })(
			AsyncServer.prototype.fail,
			methodContext("fail", metadata),
		);
		McpServer({ name: "async", version: "1.0.0" })(
			AsyncServer,
			classContext(metadata),
		);

		const server = await createMcpServer(AsyncServer);
		const client = new Client({ name: "test-client", version: "1.0.0" });
		const [clientTransport, serverTransport] =
			InMemoryTransport.createLinkedPair();
		await Promise.all([
			client.connect(clientTransport),
			server.connect(serverTransport),
		]);

		const greeting = await client.request(
			{
				method: "tools/call",
				params: { name: "greet", arguments: { name: "Ada" } },
			},
			CallToolResultSchema,
		);
		const failure = await client.request(
			{ method: "tools/call", params: { name: "fail", arguments: {} } },
			CallToolResultSchema,
		);

		expect(greeting.content).toEqual([{ type: "text", text: "Hello, Ada" }]);
		expect(failure).toEqual({
			content: [{ type: "text", text: "Tool execution failed" }],
			isError: true,
		});
		expect(JSON.stringify(failure)).not.toContain("application secret");

		await Promise.all([client.close(), server.close()]);
	});

	it("uses a custom resolver for dependency-requiring servers and normalizes JSON values", async () => {
		class DependencyServer {
			public constructor(private readonly prefix: string) {}

			public details(input: { id: number }): { label: string; id: number } {
				return { label: `${this.prefix}-${input.id}`, id: input.id };
			}

			public structured(input: { id: number }): {
				structuredContent: { answer: number };
			} {
				return { structuredContent: { answer: input.id } };
			}
		}

		const metadata: DecoratorMetadata = {};
		McpTool({ input: z.object({ id: z.number() }) })(
			DependencyServer.prototype.details,
			methodContext("details", metadata),
		);
		McpTool({ input: z.object({ id: z.number() }) })(
			DependencyServer.prototype.structured,
			methodContext("structured", metadata),
		);
		McpServer({ name: "dependency", version: "1.0.0" })(
			DependencyServer,
			classContext(metadata),
		);

		const server = await createMcpServer(DependencyServer, {
			resolve: () => new DependencyServer("record"),
		});
		const client = new Client({ name: "test-client", version: "1.0.0" });
		const [clientTransport, serverTransport] =
			InMemoryTransport.createLinkedPair();
		await Promise.all([
			client.connect(clientTransport),
			server.connect(serverTransport),
		]);

		const result = await client.request(
			{
				method: "tools/call",
				params: { name: "details", arguments: { id: 7 } },
			},
			CallToolResultSchema,
		);

		const structuredResult = await client.request(
			{
				method: "tools/call",
				params: { name: "structured", arguments: { id: 42 } },
			},
			CallToolResultSchema,
		);

		expect(result).toMatchObject({
			content: [{ type: "text", text: '{"label":"record-7","id":7}' }],
			structuredContent: { label: "record-7", id: 7 },
		});
		expect(structuredResult).toMatchObject({
			content: [],
			structuredContent: { answer: 42 },
		});

		await Promise.all([client.close(), server.close()]);
	});
});

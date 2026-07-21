import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
	McpPrompt,
	McpResource,
	McpServer,
	McpTool,
	readMcpServerDefinition,
	TypeMcpDefinitionError,
} from "../src/index.js";

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
		name: "ValidationServer",
		metadata,
		addInitializer: () => undefined,
	};
}

function decorateServer(
	serverClass: new () => object,
	metadata: DecoratorMetadata,
): void {
	McpServer({ name: "validation", version: "1.0.0" })(
		serverClass,
		classContext(metadata),
	);
}

describe("readMcpServerDefinition", () => {
	it("rejects a class without an MCP server definition", () => {
		class UndecoratedServer {}

		expect(() => readMcpServerDefinition(UndecoratedServer)).toThrow(
			TypeMcpDefinitionError,
		);
		expect(() => readMcpServerDefinition(UndecoratedServer)).toThrow(
			"UndecoratedServer",
		);
	});

	it.each([
		{
			apply: (metadata: DecoratorMetadata) => {
				McpTool({ name: "duplicate-tool", input: z.object({}) })(
					() => undefined,
					methodContext("firstTool", metadata),
				);
				McpTool({ name: "duplicate-tool", input: z.object({}) })(
					() => undefined,
					methodContext("secondTool", metadata),
				);
			},
			name: "duplicate-tool",
		},
		{
			apply: (metadata: DecoratorMetadata) => {
				McpResource({ name: "duplicate-resource", uri: "config://first" })(
					() => undefined,
					methodContext("firstResource", metadata),
				);
				McpResource({ name: "duplicate-resource", uri: "config://second" })(
					() => undefined,
					methodContext("secondResource", metadata),
				);
			},
			name: "duplicate-resource",
		},
		{
			apply: (metadata: DecoratorMetadata) => {
				McpPrompt({ name: "duplicate-prompt" })(
					() => undefined,
					methodContext("firstPrompt", metadata),
				);
				McpPrompt({ name: "duplicate-prompt" })(
					() => undefined,
					methodContext("secondPrompt", metadata),
				);
			},
			name: "duplicate-prompt",
		},
	])("rejects duplicate names inside one MCP namespace", ({ apply, name }) => {
		class DuplicateServer {}
		const metadata: DecoratorMetadata = {};

		apply(metadata);
		decorateServer(DuplicateServer, metadata);

		const readDefinition = (): void => {
			readMcpServerDefinition(DuplicateServer);
		};

		expect(readDefinition).toThrow(TypeMcpDefinitionError);
		expect(readDefinition).toThrow("DuplicateServer");
		expect(readDefinition).toThrow(name);
	});

	it("allows the same public name in distinct MCP namespaces", () => {
		class NamespaceServer {}
		const metadata: DecoratorMetadata = {};

		McpTool({ name: "status", input: z.object({}) })(
			() => undefined,
			methodContext("toolStatus", metadata),
		);
		McpResource({ name: "status", uri: "config://status" })(
			() => undefined,
			methodContext("resourceStatus", metadata),
		);
		McpPrompt({ name: "status" })(
			() => undefined,
			methodContext("promptStatus", metadata),
		);
		decorateServer(NamespaceServer, metadata);

		const definition = readMcpServerDefinition(NamespaceServer);
		const secondDefinition = readMcpServerDefinition(NamespaceServer);

		expect(definition).not.toBe(secondDefinition);
		expect(definition.tools[0]?.name).toBe("status");
		expect(definition.resources[0]?.name).toBe("status");
		expect(definition.prompts[0]?.name).toBe("status");
		expect(Object.isFrozen(definition)).toBe(true);
		expect(Object.isFrozen(definition.tools)).toBe(true);
		expect(Object.isFrozen(definition.tools[0])).toBe(true);
		expect(Object.isFrozen(definition.resources)).toBe(true);
		expect(Object.isFrozen(definition.resources[0])).toBe(true);
		expect(Object.isFrozen(definition.prompts)).toBe(true);
		expect(Object.isFrozen(definition.prompts[0])).toBe(true);
	});
});

import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
	createMcpServer,
	disableMcpComponents,
	enableMcpComponents,
	getMcpServerDefinition,
	McpPrompt,
	McpResource,
	McpServer,
	McpTool,
} from "../src/index.js";
import { createMcpTestSession } from "../src/testing.js";

function methodContext(
	name: string,
	metadata: DecoratorMetadata,
): ClassMethodDecoratorContext {
	return {
		kind: "method",
		name,
		static: false,
		private: false,
		access: { has: () => true, get: () => () => undefined },
		metadata,
		addInitializer: () => undefined,
	};
}

function classContext(metadata: DecoratorMetadata): ClassDecoratorContext {
	return {
		kind: "class",
		name: "VisibilityServer",
		metadata,
		addInitializer: () => undefined,
	};
}

describe("MCP component visibility", () => {
	it("controls listings and dispatch through visibility filters", async () => {
		class VisibilityServer {
			publicTool(): string {
				return "public";
			}
			adminTool(): string {
				return "admin";
			}
			secret(): string {
				return "secret";
			}
			adminPrompt(): string {
				return "admin prompt";
			}
		}
		const metadata: DecoratorMetadata = {};
		McpTool({ input: z.object({}), tags: ["safe"] })(
			VisibilityServer.prototype.publicTool,
			methodContext("publicTool", metadata),
		);
		McpTool({ input: z.object({}), enabled: false, tags: ["admin"] })(
			VisibilityServer.prototype.adminTool,
			methodContext("adminTool", metadata),
		);
		McpResource({
			uri: "secret://config",
			enabled: false,
			tags: ["admin"],
		})(VisibilityServer.prototype.secret, methodContext("secret", metadata));
		McpPrompt({ enabled: false, tags: ["admin"] })(
			VisibilityServer.prototype.adminPrompt,
			methodContext("adminPrompt", metadata),
		);
		McpServer({ name: "visibility", version: "1.0.0" })(
			VisibilityServer,
			classContext(metadata),
		);

		const definition = getMcpServerDefinition(VisibilityServer);
		expect(definition?.tools[0]?.tags).toEqual(["safe"]);
		expect(Object.isFrozen(definition?.tools[0]?.tags)).toBe(true);

		const session = await createMcpTestSession(
			createMcpServer(VisibilityServer),
		);
		try {
			expect(
				(await session.client.listTools()).tools.map((tool) => tool.name),
			).toEqual(["publicTool"]);
			expect((await session.client.listResources()).resources).toEqual([]);
			expect((await session.client.listPrompts()).prompts).toEqual([]);
			await expect(
				session.client.callTool({ name: "adminTool", arguments: {} }),
			).rejects.toThrow();
			expect(() => disableMcpComponents(session.server, {})).toThrow(
				/criteria/,
			);

			expect(enableMcpComponents(session.server, { tags: ["admin"] })).toBe(3);
			expect(
				(await session.client.listTools()).tools
					.map((tool) => tool.name)
					.sort(),
			).toEqual(["adminTool", "publicTool"]);

			expect(
				disableMcpComponents(session.server, {
					keys: ["tool:adminTool"],
				}),
			).toBe(1);
			await expect(
				session.client.callTool({ name: "adminTool", arguments: {} }),
			).rejects.toThrow();
			expect(disableMcpComponents(session.server, { kinds: ["prompt"] })).toBe(
				1,
			);
			expect(disableMcpComponents(session.server, { names: ["secret"] })).toBe(
				1,
			);

			expect(
				enableMcpComponents(session.server, {
					tags: ["safe"],
					only: true,
				}),
			).toBe(1);
			expect(
				(await session.client.listTools()).tools.map((tool) => tool.name),
			).toEqual(["publicTool"]);
			expect((await session.client.listResources()).resources).toEqual([]);
			expect((await session.client.listPrompts()).prompts).toEqual([]);
		} finally {
			await session.close();
		}
	});

	it("rejects duplicate or empty component tags", async () => {
		class InvalidTagsServer {
			tool(): string {
				return "invalid";
			}
		}
		const metadata: DecoratorMetadata = {};
		McpTool({
			input: z.object({}),
			tags: ["duplicate", "duplicate"],
		})(InvalidTagsServer.prototype.tool, methodContext("tool", metadata));
		McpServer({ name: "invalid-tags", version: "1.0.0" })(
			InvalidTagsServer,
			classContext(metadata),
		);

		await expect(createMcpServer(InvalidTagsServer)).rejects.toThrow(
			/unique non-empty tags/,
		);
	});
});

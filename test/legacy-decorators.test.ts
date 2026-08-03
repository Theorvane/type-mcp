import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
	getMcpServerDefinition,
	McpPrompt,
	McpResource,
	McpServer,
	McpTool,
} from "../src/legacy.js";

describe("legacy MCP decorators", () => {
	it("registers public instance components in the existing server definition format", () => {
		const input = z.object({ query: z.string() });

		class LegacyServer {
			search({ query }: { readonly query: string }) {
				return { query };
			}

			config() {
				return { region: "ap-northeast-2" };
			}

			prompt() {
				return "Search the catalog.";
			}
		}

		const prototype = LegacyServer.prototype;
		McpTool({ name: "search", description: "Searches the catalog.", input })(
			prototype,
			"search",
			Object.getOwnPropertyDescriptor(prototype, "search") ?? {},
		);
		McpResource({ uri: "config://legacy" })(
			prototype,
			"config",
			Object.getOwnPropertyDescriptor(prototype, "config") ?? {},
		);
		McpPrompt({ description: "Creates a search prompt." })(
			prototype,
			"prompt",
			Object.getOwnPropertyDescriptor(prototype, "prompt") ?? {},
		);
		McpServer({ name: "legacy", version: "1.0.0" })(LegacyServer);

		expect(getMcpServerDefinition(LegacyServer)).toEqual({
			name: "legacy",
			version: "1.0.0",
			tools: [
				{
					name: "search",
					methodName: "search",
					description: "Searches the catalog.",
					input,
				},
			],
			resources: [
				{ name: "config", methodName: "config", uri: "config://legacy" },
			],
			prompts: [
				{
					name: "prompt",
					methodName: "prompt",
					description: "Creates a search prompt.",
				},
			],
		});
	});

	it("rejects non-method and symbol-named declarations", () => {
		const input = z.object({});
		const symbol = Symbol("legacy");

		expect(() =>
			McpTool({ input })({}, symbol, { value: () => undefined }),
		).toThrow("MCP decorators require string-named methods");
		expect(() => McpTool({ input })({}, "field", {})).toThrow(
			"MCP decorators can decorate methods only",
		);
	});
});

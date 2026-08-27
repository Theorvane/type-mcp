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
		const outputSchema = z.object({ query: z.string() });

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
		McpTool({
			name: "search",
			title: "Search catalog",
			description: "Searches the catalog.",
			input,
			outputSchema,
			annotations: { readOnlyHint: true },
			_meta: { owner: "legacy-team" },
		})(
			prototype,
			"search",
			Object.getOwnPropertyDescriptor(prototype, "search") ?? {},
		);
		McpResource({
			title: "Legacy configuration",
			uri: "config://legacy",
			icons: [{ src: "https://example.test/legacy.svg" }],
			annotations: { priority: 0.4 },
			_meta: { owner: "legacy-team" },
		})(
			prototype,
			"config",
			Object.getOwnPropertyDescriptor(prototype, "config") ?? {},
		);
		McpPrompt({
			title: "Search prompt",
			description: "Creates a search prompt.",
		})(
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
					title: "Search catalog",
					description: "Searches the catalog.",
					input,
					outputSchema,
					annotations: { readOnlyHint: true },
					_meta: { owner: "legacy-team" },
				},
			],
			resources: [
				{
					name: "config",
					methodName: "config",
					title: "Legacy configuration",
					uri: "config://legacy",
					icons: [{ src: "https://example.test/legacy.svg" }],
					annotations: { priority: 0.4 },
					_meta: { owner: "legacy-team" },
				},
			],
			prompts: [
				{
					name: "prompt",
					methodName: "prompt",
					title: "Search prompt",
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

import { describe, expect, it } from "vitest";
import { normalizeToolResult } from "../src/compiler/normalize-tool-result.js";

describe("tool result normalization", () => {
	it("preserves explicit MCP results", () => {
		const result = {
			content: [{ type: "text" as const, text: "explicit" }],
			structuredContent: { source: "handler" },
		};

		expect(normalizeToolResult(result)).toEqual(result);
	});

	it("keeps non-object JSON values text-only", () => {
		expect(normalizeToolResult(["first", "second"])).toEqual({
			content: [{ type: "text", text: '["first","second"]' }],
		});
		expect(normalizeToolResult(42)).toEqual({
			content: [{ type: "text", text: "42" }],
		});
	});
});

import { describe, expect, it } from "vitest";
import { normalizeToolResult } from "../src/compiler/normalize-tool-result.js";
import { McpAudio, McpImage } from "../src/index.js";

describe("MCP media helpers", () => {
	it("normalizes copied image and audio bytes into standard content", () => {
		const imageBytes = new Uint8Array([137, 80, 78, 71]);
		const image = new McpImage(imageBytes, {
			mimeType: "image/png",
			annotations: { audience: ["user"] },
		});
		imageBytes[0] = 0;

		const audio = new McpAudio(new Uint8Array([82, 73, 70, 70]), {
			mimeType: "audio/wav",
		});

		expect(normalizeToolResult([image, "preview", audio])).toEqual({
			content: [
				{
					type: "image",
					data: "iVBORw==",
					mimeType: "image/png",
					annotations: { audience: ["user"] },
				},
				{ type: "text", text: "preview" },
				{
					type: "audio",
					data: "UklGRg==",
					mimeType: "audio/wav",
				},
			],
		});
		expect(Object.isFrozen(image)).toBe(true);
	});

	it("rejects MIME types from the wrong media family", () => {
		expect(
			() => new McpImage(new Uint8Array([1]), { mimeType: "audio/wav" }),
		).toThrow(/image/);
		expect(
			() => new McpAudio(new Uint8Array([1]), { mimeType: "image/png" }),
		).toThrow(/audio/);
	});
});

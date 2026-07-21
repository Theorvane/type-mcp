import {
	type CallToolResult,
	CallToolResultSchema,
} from "@modelcontextprotocol/sdk/types.js";

function isRecord(result: unknown): result is Record<string, unknown> {
	return typeof result === "object" && result !== null;
}

function hasMcpContent(result: unknown): result is { content: unknown[] } {
	return isRecord(result) && Array.isArray(result.content);
}

export function normalizeToolResult(result: unknown): CallToolResult {
	if (typeof result === "string") {
		return { content: [{ type: "text", text: result }] };
	}

	if (hasMcpContent(result)) {
		const parsed = CallToolResultSchema.safeParse(result);
		if (parsed.success) {
			return parsed.data;
		}
	}

	const json = JSON.stringify(result);
	if (json === undefined) {
		throw new TypeError("Tool result must be JSON-compatible");
	}

	return { content: [{ type: "text", text: json }] };
}

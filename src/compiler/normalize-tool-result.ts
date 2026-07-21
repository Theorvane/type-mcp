import {
	type CallToolResult,
	CallToolResultSchema,
} from "@modelcontextprotocol/sdk/types.js";

function isRecord(result: unknown): result is Record<string, unknown> {
	return typeof result === "object" && result !== null;
}

function isMcpToolResultCandidate(result: unknown): boolean {
	return (
		isRecord(result) &&
		(Array.isArray(result.content) ||
			"structuredContent" in result ||
			"isError" in result)
	);
}

export function normalizeToolResult(result: unknown): CallToolResult {
	if (typeof result === "string") {
		return { content: [{ type: "text", text: result }] };
	}

	if (isMcpToolResultCandidate(result)) {
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

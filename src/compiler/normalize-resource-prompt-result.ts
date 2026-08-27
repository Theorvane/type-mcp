import {
	type GetPromptResult,
	type ReadResourceResult,
	specTypeSchemas,
} from "@modelcontextprotocol/server";

function isRecord(result: unknown): result is Record<string, unknown> {
	return typeof result === "object" && result !== null;
}

function serializeResult(result: unknown): string {
	if (typeof result === "string") {
		return result;
	}

	const json = JSON.stringify(result);
	if (json === undefined) {
		throw new TypeError("MCP handler result must be JSON-compatible");
	}

	return json;
}

export function normalizeResourceResult(
	result: unknown,
	uri: URL,
	mimeType: string | undefined,
): ReadResourceResult {
	if (isRecord(result) && Array.isArray(result.contents)) {
		const parsed =
			specTypeSchemas.ReadResourceResult["~standard"].validate(result);
		if ("value" in parsed) {
			return parsed.value;
		}
	}

	return {
		contents: [
			{
				uri: uri.toString(),
				text: serializeResult(result),
				...(mimeType === undefined ? {} : { mimeType }),
			},
		],
	};
}

export function normalizePromptResult(result: unknown): GetPromptResult {
	if (isRecord(result) && Array.isArray(result.messages)) {
		const parsed =
			specTypeSchemas.GetPromptResult["~standard"].validate(result);
		if ("value" in parsed) {
			return parsed.value;
		}
	}

	return {
		messages: [
			{
				role: "user",
				content: { type: "text", text: serializeResult(result) },
			},
		],
	};
}

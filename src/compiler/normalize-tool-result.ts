import {
	type CallToolResult,
	specTypeSchemas,
} from "@modelcontextprotocol/server";
import { isMcpMedia } from "../media.js";

function normalizeMediaResult(result: unknown): CallToolResult | undefined {
	if (isMcpMedia(result)) {
		return { content: [result.toContent()] };
	}
	if (
		Array.isArray(result) &&
		result.some(isMcpMedia) &&
		result.every((item) => typeof item === "string" || isMcpMedia(item))
	) {
		return {
			content: result.map((item) =>
				typeof item === "string"
					? { type: "text" as const, text: item }
					: item.toContent(),
			),
		};
	}
	return undefined;
}

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
	const mediaResult = normalizeMediaResult(result);
	if (mediaResult !== undefined) {
		return mediaResult;
	}

	if (typeof result === "string") {
		return { content: [{ type: "text", text: result }] };
	}

	if (isMcpToolResultCandidate(result)) {
		const parsed = specTypeSchemas.CallToolResult["~standard"].validate(result);
		if ("value" in parsed) {
			return parsed.value;
		}
	}

	const json = JSON.stringify(result);
	if (json === undefined) {
		throw new TypeError("Tool result must be JSON-compatible");
	}

	const content = [{ type: "text" as const, text: json }];
	if (isRecord(result) && !Array.isArray(result)) {
		const serialized: unknown = JSON.parse(json);
		if (isRecord(serialized) && !Array.isArray(serialized)) {
			return { content, structuredContent: serialized };
		}
	}

	return { content };
}

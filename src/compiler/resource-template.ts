import type { CompleteResourceTemplateCallback } from "@modelcontextprotocol/server";
import { ResourceTemplate } from "@modelcontextprotocol/server";
import type { McpResourceDefinition } from "../types.js";

export function createResourceTemplate(
	resource: McpResourceDefinition,
): ResourceTemplate {
	const complete: Record<string, CompleteResourceTemplateCallback> = {};
	for (const [variable, callback] of Object.entries(resource.complete ?? {})) {
		complete[variable] = async (value, context) => {
			try {
				const suggestions: unknown = await callback(value, context);
				return Array.isArray(suggestions)
					? suggestions.filter(
							(suggestion): suggestion is string =>
								typeof suggestion === "string",
						)
					: [];
			} catch {
				return [];
			}
		};
	}

	return new ResourceTemplate(resource.uri, {
		list: undefined,
		...(Object.keys(complete).length === 0 ? {} : { complete }),
	});
}

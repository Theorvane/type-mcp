import { appendToolDefinition } from "../metadata/metadata.js";
import type { McpToolOptions } from "../types.js";

export function McpTool(options: McpToolOptions) {
	return function (_value: object, context: ClassMethodDecoratorContext): void {
		const methodName = getMethodName(context);

		appendToolDefinition(context.metadata, {
			name: options.name ?? methodName,
			methodName,
			title: options.title,
			description: options.description,
			input: options.input,
			outputSchema: options.outputSchema,
			annotations: options.annotations,
			_meta: options._meta,
			enabled: options.enabled,
			tags: options.tags,
		});
	};
}

function getMethodName(context: ClassMethodDecoratorContext): string {
	if (typeof context.name !== "string") {
		throw new TypeError("MCP decorators require string-named methods");
	}

	return context.name;
}

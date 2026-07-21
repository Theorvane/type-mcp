import { appendPromptDefinition } from "../metadata/metadata.js";
import type { McpPromptOptions } from "../types.js";

export function McpPrompt(options: McpPromptOptions) {
	return function (_value: object, context: ClassMethodDecoratorContext): void {
		const methodName = getMethodName(context);

		appendPromptDefinition(context.metadata, {
			name: options.name ?? methodName,
			methodName,
			description: options.description,
		});
	};
}

function getMethodName(context: ClassMethodDecoratorContext): string {
	if (typeof context.name !== "string") {
		throw new TypeError("MCP decorators require string-named methods");
	}

	return context.name;
}

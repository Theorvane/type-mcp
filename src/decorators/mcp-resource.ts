import { appendResourceDefinition } from "../metadata/metadata.js";
import type { McpResourceOptions } from "../types.js";

export function McpResource(options: McpResourceOptions) {
	return function (_value: object, context: ClassMethodDecoratorContext): void {
		const methodName = getMethodName(context);

		appendResourceDefinition(context.metadata, {
			name: options.name ?? methodName,
			methodName,
			title: options.title,
			uri: options.uri,
			mimeType: options.mimeType,
			description: options.description,
			icons: options.icons,
			annotations: options.annotations,
			_meta: options._meta,
		});
	};
}

function getMethodName(context: ClassMethodDecoratorContext): string {
	if (typeof context.name !== "string") {
		throw new TypeError("MCP decorators require string-named methods");
	}

	return context.name;
}

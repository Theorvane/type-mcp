import { appendResourceDefinition } from "../metadata/metadata.js";
import type { McpResourceOptions } from "../types.js";

export function McpResource(options: McpResourceOptions) {
  return function (
    _value: object,
    context: ClassMethodDecoratorContext,
  ): void {
    const methodName = getMethodName(context);

    appendResourceDefinition(context.metadata, {
      name: options.name ?? methodName,
      methodName,
      uri: options.uri,
      mimeType: options.mimeType,
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

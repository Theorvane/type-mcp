import {
  readPromptDefinitions,
  readResourceDefinitions,
  readToolDefinitions,
} from "../metadata/metadata.js";
import { storeMcpServerDefinition } from "../metadata/definitions.js";
import type { McpServerConstructor, McpServerOptions } from "../types.js";

export function McpServer(options: McpServerOptions) {
  return function <T extends McpServerConstructor>(
    target: T,
    context: ClassDecoratorContext,
  ): void {
    storeMcpServerDefinition(target, {
      name: options.name,
      version: options.version,
      tools: readToolDefinitions(context.metadata),
      resources: readResourceDefinitions(context.metadata),
      prompts: readPromptDefinitions(context.metadata),
    });
  };
}

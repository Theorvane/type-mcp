import { storeMcpServerDefinition } from "../metadata/definitions.js";
import {
	readPromptDefinitions,
	readResourceDefinitions,
	readToolDefinitions,
} from "../metadata/metadata.js";
import type { McpServerConstructor, McpServerOptions } from "../types.js";

export function McpServer(options: McpServerOptions) {
	return function <T extends McpServerConstructor>(
		target: T,
		context: ClassDecoratorContext,
	): void {
		storeMcpServerDefinition(target, {
			name: options.name,
			version: options.version,
			title: options.title,
			description: options.description,
			websiteUrl: options.websiteUrl,
			icons: options.icons,
			instructions: options.instructions,
			tools: readToolDefinitions(context.metadata),
			resources: readResourceDefinitions(context.metadata),
			prompts: readPromptDefinitions(context.metadata),
		});
	};
}

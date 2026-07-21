import type {
	McpPromptDefinition,
	McpResourceDefinition,
	McpServerConstructor,
	McpServerDefinition,
	McpToolDefinition,
} from "../types.js";

export interface PendingMcpDefinitions {
	readonly tools: readonly McpToolDefinition[];
	readonly resources: readonly McpResourceDefinition[];
	readonly prompts: readonly McpPromptDefinition[];
}

const serverDefinitions = new WeakMap<
	McpServerConstructor,
	McpServerDefinition
>();

export function storeMcpServerDefinition(
	target: McpServerConstructor,
	definition: McpServerDefinition,
): void {
	serverDefinitions.set(target, freezeServerDefinition(definition));
}

export function getMcpServerDefinition(
	target: McpServerConstructor,
): McpServerDefinition | undefined {
	const definition = serverDefinitions.get(target);
	return definition === undefined
		? undefined
		: freezeServerDefinition(definition);
}

export function freezeServerDefinition(
	definition: McpServerDefinition,
): McpServerDefinition {
	return Object.freeze({
		name: definition.name,
		version: definition.version,
		tools: Object.freeze(
			definition.tools.map((tool) =>
				Object.freeze({
					name: tool.name,
					methodName: tool.methodName,
					description: tool.description,
					input: tool.input,
				}),
			),
		),
		resources: Object.freeze(
			definition.resources.map((resource) =>
				Object.freeze({
					name: resource.name,
					methodName: resource.methodName,
					uri: resource.uri,
					mimeType: resource.mimeType,
					description: resource.description,
				}),
			),
		),
		prompts: Object.freeze(
			definition.prompts.map((prompt) =>
				Object.freeze({
					name: prompt.name,
					methodName: prompt.methodName,
					description: prompt.description,
				}),
			),
		),
	});
}

import type { Icon } from "@modelcontextprotocol/server";
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

const serverDefinitions = new WeakMap<object, McpServerDefinition>();

export function storeMcpServerDefinition<
	T extends object,
	Arguments extends readonly unknown[],
>(
	target: McpServerConstructor<T, Arguments>,
	definition: McpServerDefinition,
): void {
	serverDefinitions.set(target, freezeServerDefinition(definition));
}

export function getMcpServerDefinition<
	T extends object,
	Arguments extends readonly unknown[],
>(target: McpServerConstructor<T, Arguments>): McpServerDefinition | undefined {
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
		title: definition.title,
		description: definition.description,
		websiteUrl: definition.websiteUrl,
		icons: freezeIcons(definition.icons),
		instructions: definition.instructions,
		tools: Object.freeze(
			definition.tools.map((tool) =>
				Object.freeze({
					name: tool.name,
					methodName: tool.methodName,
					title: tool.title,
					description: tool.description,
					input: tool.input,
					outputSchema: tool.outputSchema,
					annotations:
						tool.annotations === undefined
							? undefined
							: Object.freeze({ ...tool.annotations }),
					_meta:
						tool._meta === undefined
							? undefined
							: Object.freeze({ ...tool._meta }),
					...(tool.enabled === undefined ? {} : { enabled: tool.enabled }),
					...(tool.tags === undefined ? {} : { tags: freezeTags(tool.tags) }),
				}),
			),
		),
		resources: Object.freeze(
			definition.resources.map((resource) =>
				Object.freeze({
					name: resource.name,
					methodName: resource.methodName,
					title: resource.title,
					uri: resource.uri,
					mimeType: resource.mimeType,
					description: resource.description,
					icons: freezeIcons(resource.icons),
					annotations:
						resource.annotations === undefined
							? undefined
							: Object.freeze({
									...resource.annotations,
									audience:
										resource.annotations.audience === undefined
											? undefined
											: [...resource.annotations.audience],
								}),
					_meta:
						resource._meta === undefined
							? undefined
							: Object.freeze({ ...resource._meta }),
					input: resource.input,
					complete:
						resource.complete === undefined
							? undefined
							: Object.freeze({ ...resource.complete }),
					...(resource.enabled === undefined
						? {}
						: { enabled: resource.enabled }),
					...(resource.tags === undefined
						? {}
						: { tags: freezeTags(resource.tags) }),
				}),
			),
		),
		prompts: Object.freeze(
			definition.prompts.map((prompt) =>
				Object.freeze({
					name: prompt.name,
					methodName: prompt.methodName,
					title: prompt.title,
					description: prompt.description,
					args: prompt.args,
					...(prompt.enabled === undefined ? {} : { enabled: prompt.enabled }),
					...(prompt.tags === undefined
						? {}
						: { tags: freezeTags(prompt.tags) }),
				}),
			),
		),
	});
}

function freezeTags(
	tags: readonly string[] | undefined,
): readonly string[] | undefined {
	return tags === undefined ? undefined : Object.freeze([...tags]);
}

function freezeIcons(
	icons: readonly Readonly<Icon>[] | undefined,
): readonly Readonly<Icon>[] | undefined {
	return icons === undefined
		? undefined
		: Object.freeze(
				icons.map((icon) => {
					const sizes = icon.sizes === undefined ? undefined : [...icon.sizes];
					if (sizes !== undefined) {
						Object.freeze(sizes);
					}
					return Object.freeze({ ...icon, sizes });
				}),
			);
}

import { UriTemplate } from "@modelcontextprotocol/server";
import { TypeMcpDefinitionError } from "../errors.js";
import type {
	McpPromptDefinition,
	McpResourceDefinition,
	McpServerConstructor,
	McpServerDefinition,
	McpToolDefinition,
} from "../types.js";
import { getMcpServerDefinition } from "./definitions.js";

type NamedDefinition =
	| McpToolDefinition
	| McpResourceDefinition
	| McpPromptDefinition;

export function readMcpServerDefinition<
	T extends object,
	Arguments extends readonly unknown[],
>(target: McpServerConstructor<T, Arguments>): McpServerDefinition {
	const definition = getMcpServerDefinition(target);
	const className = target.name || "<anonymous>";

	if (definition === undefined) {
		throw new TypeMcpDefinitionError(
			`MCP server definition is missing for ${className}`,
		);
	}

	assertUniqueNames("tool", definition.tools, className);
	for (const tool of definition.tools) {
		assertVisibilityDeclaration("tool", tool, className);
	}
	assertUniqueNames("resource", definition.resources, className);
	for (const resource of definition.resources) {
		assertResourceDeclaration(resource, className);
		assertVisibilityDeclaration("resource", resource, className);
	}
	assertUniqueNames("prompt", definition.prompts, className);
	for (const prompt of definition.prompts) {
		assertVisibilityDeclaration("prompt", prompt, className);
	}

	return definition;
}

function assertUniqueNames(
	componentType: "tool" | "resource" | "prompt",
	definitions: readonly NamedDefinition[],
	className: string,
): void {
	const names = new Set<string>();

	for (const definition of definitions) {
		if (names.has(definition.name)) {
			throw new TypeMcpDefinitionError(
				`Duplicate MCP ${componentType} name "${definition.name}" on ${className}`,
			);
		}

		names.add(definition.name);
	}
}

function assertVisibilityDeclaration(
	componentType: "tool" | "resource" | "prompt",
	definition: NamedDefinition,
	className: string,
): void {
	if (
		definition.enabled !== undefined &&
		typeof definition.enabled !== "boolean"
	) {
		throw new TypeMcpDefinitionError(
			`MCP ${componentType} "${definition.name}" on ${className} has an invalid enabled value`,
		);
	}
	if (definition.tags === undefined) {
		return;
	}
	if (!Array.isArray(definition.tags)) {
		throw new TypeMcpDefinitionError(
			`MCP ${componentType} "${definition.name}" on ${className} has invalid tags`,
		);
	}
	const tags = new Set<string>();
	for (const tag of definition.tags) {
		if (typeof tag !== "string" || tag.trim().length === 0 || tags.has(tag)) {
			throw new TypeMcpDefinitionError(
				`MCP ${componentType} "${definition.name}" on ${className} requires unique non-empty tags`,
			);
		}
		tags.add(tag);
	}
}

function assertResourceDeclaration(
	resource: McpResourceDefinition,
	className: string,
): void {
	if (!UriTemplate.isTemplate(resource.uri)) {
		if (resource.input !== undefined || resource.complete !== undefined) {
			throw new TypeMcpDefinitionError(
				`Static MCP resource "${resource.name}" on ${className} cannot declare template input or completion`,
			);
		}
		return;
	}

	if (resource.input === undefined) {
		throw new TypeMcpDefinitionError(
			`MCP resource template "${resource.name}" on ${className} requires an input schema`,
		);
	}

	let template: UriTemplate;
	try {
		template = new UriTemplate(resource.uri);
	} catch {
		throw new TypeMcpDefinitionError(
			`MCP resource template "${resource.name}" on ${className} has an invalid URI template`,
		);
	}
	const variables = new Set(template.variableNames);
	const fields = new Set(Object.keys(resource.input.shape));
	for (const variable of variables) {
		if (!fields.has(variable)) {
			throw new TypeMcpDefinitionError(
				`MCP resource template "${resource.name}" variable "${variable}" is missing from its input schema`,
			);
		}
	}
	for (const field of fields) {
		if (!variables.has(field)) {
			throw new TypeMcpDefinitionError(
				`MCP resource template "${resource.name}" input field "${field}" is missing from its URI template`,
			);
		}
	}
	for (const variable of Object.keys(resource.complete ?? {})) {
		if (!variables.has(variable)) {
			throw new TypeMcpDefinitionError(
				`MCP resource template "${resource.name}" completion variable "${variable}" is missing from its URI template`,
			);
		}
	}
}

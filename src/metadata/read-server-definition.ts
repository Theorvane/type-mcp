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

export function readMcpServerDefinition(
	target: McpServerConstructor,
): McpServerDefinition {
	const definition = getMcpServerDefinition(target);
	const className = target.name || "<anonymous>";

	if (definition === undefined) {
		throw new TypeMcpDefinitionError(
			`MCP server definition is missing for ${className}`,
		);
	}

	assertUniqueNames("tool", definition.tools, className);
	assertUniqueNames("resource", definition.resources, className);
	assertUniqueNames("prompt", definition.prompts, className);

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

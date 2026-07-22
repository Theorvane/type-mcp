import { DynamicStructuredTool } from "@langchain/core/tools";
import { readMcpServerDefinition } from "../metadata/read-server-definition.js";
import type { InstanceResolver } from "../resolver/instance-resolver.js";
import { resolveMcpServerInstance } from "../resolver/resolve-server-instance.js";
import type {
	McpServerConstructor,
	McpToolDefinition,
	ZeroArgumentMcpServerConstructor,
} from "../types.js";

const TOOL_EXECUTION_FAILED = "Tool execution failed";

export interface CreateLangChainToolsOptions<T extends object> {
	readonly resolver: InstanceResolver<T>;
}

export function createLangChainTools<T extends object>(
	serverClass: ZeroArgumentMcpServerConstructor<T>,
): Promise<readonly DynamicStructuredTool[]>;
export function createLangChainTools<
	T extends object,
	Arguments extends readonly unknown[],
>(
	serverClass: McpServerConstructor<T, Arguments>,
	options: CreateLangChainToolsOptions<T>,
): Promise<readonly DynamicStructuredTool[]>;
export async function createLangChainTools<
	T extends object,
	Arguments extends readonly unknown[],
>(
	serverClass: McpServerConstructor<T, Arguments>,
	options?: CreateLangChainToolsOptions<T>,
): Promise<readonly DynamicStructuredTool[]> {
	const definition = readMcpServerDefinition(serverClass);
	const instance = options
		? await resolveMcpServerInstance(serverClass, options.resolver)
		: await resolveMcpServerInstance(
				serverClass as ZeroArgumentMcpServerConstructor<T>,
			);

	return definition.tools.map((tool) => createLangChainTool(instance, tool));
}

function createLangChainTool(
	instance: object,
	definition: McpToolDefinition,
): DynamicStructuredTool {
	return new DynamicStructuredTool({
		name: definition.name,
		description: definition.description ?? `${definition.name} tool`,
		schema: definition.input,
		func: async (input) => invokeSafely(instance, definition.methodName, input),
	});
}

async function invokeSafely(
	instance: object,
	methodName: string,
	input: unknown,
): Promise<string> {
	try {
		const method = Reflect.get(instance, methodName);
		if (typeof method !== "function") {
			return TOOL_EXECUTION_FAILED;
		}

		const result = await Reflect.apply(method, instance, [input]);
		if (typeof result === "string") {
			return result;
		}

		const serialized = JSON.stringify(result);
		return serialized === undefined ? TOOL_EXECUTION_FAILED : serialized;
	} catch {
		return TOOL_EXECUTION_FAILED;
	}
}

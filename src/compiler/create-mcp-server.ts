import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { readMcpServerDefinition } from "../metadata/read-server-definition.js";
import type { InstanceResolver } from "../resolver/instance-resolver.js";
import { resolveMcpServerInstance } from "../resolver/resolve-server-instance.js";
import type {
	McpServerConstructor,
	ZeroArgumentMcpServerConstructor,
} from "../types.js";
import { normalizeToolResult } from "./normalize-tool-result.js";

export async function createMcpServer<T extends object>(
	serverClass: ZeroArgumentMcpServerConstructor<T>,
): Promise<McpServer>;
export async function createMcpServer<
	T extends object,
	Arguments extends readonly unknown[],
>(
	serverClass: McpServerConstructor<T, Arguments>,
	resolver: InstanceResolver<T>,
): Promise<McpServer>;
export async function createMcpServer<
	T extends object,
	Arguments extends readonly unknown[],
>(
	serverClass: McpServerConstructor<T, Arguments>,
	resolver?: InstanceResolver<T>,
): Promise<McpServer> {
	const definition = readMcpServerDefinition(serverClass);
	const instance = resolver
		? await resolveMcpServerInstance(serverClass, resolver)
		: await resolveMcpServerInstance(
				serverClass as ZeroArgumentMcpServerConstructor<T>,
			);
	const server = new McpServer({
		name: definition.name,
		version: definition.version,
	});

	for (const tool of definition.tools) {
		server.registerTool(
			tool.name,
			{
				inputSchema: tool.input,
				...(tool.description === undefined
					? {}
					: { description: tool.description }),
			},
			async (input) => {
				try {
					const result = await invokeTool(instance, tool.methodName, input);
					return normalizeToolResult(result);
				} catch {
					return {
						content: [{ type: "text", text: "Tool execution failed" }],
						isError: true,
					};
				}
			},
		);
	}

	return server;
}

function invokeTool(
	instance: object,
	methodName: string,
	input: unknown,
): unknown | Promise<unknown> {
	const method = Reflect.get(instance, methodName);
	if (typeof method !== "function") {
		throw new TypeError("Decorated tool method is not callable");
	}

	return Reflect.apply(method, instance, [input]);
}

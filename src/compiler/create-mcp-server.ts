import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { readMcpServerDefinition } from "../metadata/read-server-definition.js";
import type { InstanceResolver } from "../resolver/instance-resolver.js";
import { resolveMcpServerInstance } from "../resolver/resolve-server-instance.js";
import type {
	McpServerConstructor,
	ZeroArgumentMcpServerConstructor,
} from "../types.js";
import {
	normalizePromptResult,
	normalizeResourceResult,
} from "./normalize-resource-prompt-result.js";
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

	for (const resource of definition.resources) {
		server.registerResource(
			resource.name,
			resource.uri,
			{
				...(resource.description === undefined
					? {}
					: { description: resource.description }),
				...(resource.mimeType === undefined
					? {}
					: { mimeType: resource.mimeType }),
			},
			async (uri) => {
				try {
					const result = await invokeMethod(instance, resource.methodName, []);
					return normalizeResourceResult(result, uri, resource.mimeType);
				} catch {
					return normalizeResourceResult(
						"Resource execution failed",
						uri,
						resource.mimeType,
					);
				}
			},
		);
	}

	for (const prompt of definition.prompts) {
		server.registerPrompt(
			prompt.name,
			{
				...(prompt.description === undefined
					? {}
					: { description: prompt.description }),
			},
			async () => {
				try {
					const result = await invokeMethod(instance, prompt.methodName, []);
					return normalizePromptResult(result);
				} catch {
					return normalizePromptResult("Prompt execution failed");
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
	return invokeMethod(instance, methodName, [input]);
}

function invokeMethod(
	instance: object,
	methodName: string,
	arguments_: readonly unknown[],
): unknown | Promise<unknown> {
	const method = Reflect.get(instance, methodName);
	if (typeof method !== "function") {
		throw new TypeError("Decorated MCP method is not callable");
	}

	return Reflect.apply(method, instance, arguments_);
}

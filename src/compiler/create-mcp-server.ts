import {
	McpServer,
	type ServerContext,
	UriTemplate,
} from "@modelcontextprotocol/server";
import { createMcpInvocationContext } from "../invocation-context.js";
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
import { createResourceTemplate } from "./resource-template.js";

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
	const server = new McpServer(
		{
			name: definition.name,
			version: definition.version,
			...(definition.title === undefined ? {} : { title: definition.title }),
			...(definition.description === undefined
				? {}
				: { description: definition.description }),
			...(definition.websiteUrl === undefined
				? {}
				: { websiteUrl: definition.websiteUrl }),
			...(definition.icons === undefined
				? {}
				: {
						icons: definition.icons.map((icon) => ({
							...icon,
							sizes: icon.sizes === undefined ? undefined : [...icon.sizes],
						})),
					}),
		},
		definition.instructions === undefined
			? undefined
			: { instructions: definition.instructions },
	);

	for (const tool of definition.tools) {
		server.registerTool(
			tool.name,
			{
				inputSchema: tool.input,
				...(tool.title === undefined ? {} : { title: tool.title }),
				...(tool.description === undefined
					? {}
					: { description: tool.description }),
				...(tool.outputSchema === undefined
					? {}
					: { outputSchema: tool.outputSchema }),
				...(tool.annotations === undefined
					? {}
					: { annotations: { ...tool.annotations } }),
				...(tool._meta === undefined ? {} : { _meta: { ...tool._meta } }),
			},
			async (input, context) => {
				try {
					const result = await invokeMethod(instance, tool.methodName, [
						input,
						createMcpInvocationContext(context),
					]);
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
		const config = {
			...(resource.title === undefined ? {} : { title: resource.title }),
			...(resource.description === undefined
				? {}
				: { description: resource.description }),
			...(resource.mimeType === undefined
				? {}
				: { mimeType: resource.mimeType }),
			...(resource.icons === undefined
				? {}
				: {
						icons: resource.icons.map((icon) => ({
							...icon,
							sizes: icon.sizes === undefined ? undefined : [...icon.sizes],
						})),
					}),
			...(resource.annotations === undefined
				? {}
				: {
						annotations: {
							...resource.annotations,
							audience:
								resource.annotations.audience === undefined
									? undefined
									: [...resource.annotations.audience],
						},
					}),
			...(resource._meta === undefined ? {} : { _meta: { ...resource._meta } }),
		};
		if (!UriTemplate.isTemplate(resource.uri)) {
			server.registerResource(
				resource.name,
				resource.uri,
				config,
				async (uri, context) => {
					try {
						const result = await invokeMethod(instance, resource.methodName, [
							createMcpInvocationContext(context),
						]);
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
			continue;
		}

		const input = resource.input;
		if (input === undefined) {
			throw new TypeError("Validated resource template input is missing");
		}
		server.registerResource(
			resource.name,
			createResourceTemplate(resource),
			config,
			async (uri, variables, context) => {
				try {
					const parsed = await input.safeParseAsync(variables);
					if (!parsed.success) {
						throw new TypeError("Resource template input validation failed");
					}
					const result = await invokeMethod(instance, resource.methodName, [
						parsed.data,
						createMcpInvocationContext(context),
					]);
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
		const config = {
			...(prompt.title === undefined ? {} : { title: prompt.title }),
			...(prompt.description === undefined
				? {}
				: { description: prompt.description }),
		};
		if (prompt.args === undefined) {
			server.registerPrompt(prompt.name, config, async (context: unknown) => {
				try {
					if (!isServerContext(context)) {
						throw new TypeError("MCP prompt context is unavailable");
					}
					const result = await invokeMethod(instance, prompt.methodName, [
						createMcpInvocationContext(context),
					]);
					return normalizePromptResult(result);
				} catch {
					return normalizePromptResult("Prompt execution failed");
				}
			});
		} else {
			server.registerPrompt(
				prompt.name,
				{ ...config, argsSchema: prompt.args },
				async (input, context) => {
					try {
						const result = await invokeMethod(instance, prompt.methodName, [
							input,
							createMcpInvocationContext(context),
						]);
						return normalizePromptResult(result);
					} catch {
						return normalizePromptResult("Prompt execution failed");
					}
				},
			);
		}
	}

	return server;
}

function isServerContext(value: unknown): value is ServerContext {
	if (typeof value !== "object" || value === null || !("mcpReq" in value)) {
		return false;
	}
	const mcpReq = Reflect.get(value, "mcpReq");
	return (
		typeof mcpReq === "object" &&
		mcpReq !== null &&
		"id" in mcpReq &&
		Reflect.get(mcpReq, "signal") instanceof AbortSignal &&
		typeof Reflect.get(mcpReq, "notify") === "function"
	);
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

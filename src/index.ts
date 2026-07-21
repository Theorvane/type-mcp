export { McpPrompt } from "./decorators/mcp-prompt.js";
export { McpResource } from "./decorators/mcp-resource.js";
export { McpServer } from "./decorators/mcp-server.js";
export { McpTool } from "./decorators/mcp-tool.js";
export { TypeMcpDefinitionError } from "./errors.js";
export { getMcpServerDefinition } from "./metadata/definitions.js";
export { readMcpServerDefinition } from "./metadata/read-server-definition.js";
export { defaultInstanceResolver } from "./resolver/default-instance-resolver.js";
export type { InstanceResolver } from "./resolver/instance-resolver.js";
export { resolveMcpServerInstance } from "./resolver/resolve-server-instance.js";
export type {
	McpPromptDefinition,
	McpPromptOptions,
	McpResourceDefinition,
	McpResourceOptions,
	McpServerConstructor,
	McpServerDefinition,
	McpServerOptions,
	McpToolDefinition,
	McpToolOptions,
} from "./types.js";

/**
 * Compiles a decorated class into an MCP server.
 *
 * The implementation is introduced with the compiler task; this export exists
 * now to establish the stable package entry point.
 */
export function createMcpServer(): never {
	throw new Error("createMcpServer is not implemented yet");
}

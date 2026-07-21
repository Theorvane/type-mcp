export { McpPrompt } from "./decorators/mcp-prompt.js";
export { McpResource } from "./decorators/mcp-resource.js";
export { McpServer } from "./decorators/mcp-server.js";
export { McpTool } from "./decorators/mcp-tool.js";
export { getMcpServerDefinition } from "./metadata/definitions.js";
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

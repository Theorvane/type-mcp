import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";

export interface McpServerConnection {
	connect(transport: Transport): Promise<void>;
}

export interface StdioServerOptions {
	readonly transportFactory?: () => Transport;
}

export interface StartedStdioServer<Server extends McpServerConnection> {
	readonly server: Server;
	readonly transport: Transport;
}

/**
 * Connects an MCP SDK server to Node's standard input and output streams.
 *
 * The optional transport factory exists for deterministic tests. Production
 * callers should rely on the official SDK StdioServerTransport default.
 */
export async function startStdioServer<Server extends McpServerConnection>(
	server: Server,
	options: StdioServerOptions = {},
): Promise<StartedStdioServer<Server>> {
	const transport = options.transportFactory?.() ?? new StdioServerTransport();
	await server.connect(transport);
	return { server, transport };
}

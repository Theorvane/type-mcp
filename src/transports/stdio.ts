import type { McpServerFactory, Transport } from "@modelcontextprotocol/server";
import type {
	ServeStdioOptions,
	StdioServerHandle,
} from "@modelcontextprotocol/server/stdio";
import {
	StdioServerTransport,
	serveStdio,
} from "@modelcontextprotocol/server/stdio";

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

/** Options for the protocol-negotiating stdio server entry point. */
export type StdioProtocolServerOptions = ServeStdioOptions;

/** Handle owned by the protocol-negotiating stdio server entry point. */
export type StdioProtocolServerHandle = StdioServerHandle;

/**
 * Serves both 2025 and 2026 MCP protocols over stdio from a fresh-server factory.
 */
export function serveStdioServer(
	factory: McpServerFactory,
	options: StdioProtocolServerOptions = {},
): StdioProtocolServerHandle {
	return serveStdio(factory, options);
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

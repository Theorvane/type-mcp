import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";

export interface McpHttpServerConnection {
	connect(transport: Transport): Promise<void>;
}

export type McpHandler = (request: Request) => Promise<Response>;

export interface McpHandlerOptions {
	/**
	 * Returns JSON responses instead of SSE streams for request/response MCP calls.
	 * Defaults to true for a simple Fetch handler.
	 */
	readonly enableJsonResponse?: boolean;
}

/**
 * Creates a Fetch-compatible Streamable HTTP handler for one MCP SDK server.
 *
 * HTTP methods, JSON-RPC framing, and stateful session behavior are delegated
 * to the official Web Standard transport.
 */
export async function createMcpHandler<Server extends McpHttpServerConnection>(
	createServer: () => Server | Promise<Server>,
	options: McpHandlerOptions = {},
): Promise<McpHandler> {
	const server = await createServer();
	const transport = new WebStandardStreamableHTTPServerTransport({
		sessionIdGenerator: () => crypto.randomUUID(),
		enableJsonResponse: options.enableJsonResponse ?? true,
	});
	await server.connect(transport);

	return (request) => transport.handleRequest(request);
}

import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";

export interface McpHttpServerConnection {
	connect(transport: Transport): Promise<void>;
	close(): Promise<void>;
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
 * Creates a Fetch-compatible Streamable HTTP handler with SDK-managed sessions.
 *
 * Each stateful MCP session receives its own compiled server and official Web
 * Standard transport. HTTP methods, JSON-RPC framing, and session validation
 * remain delegated to the SDK transport.
 */
export function createMcpHandler<Server extends McpHttpServerConnection>(
	createServer: () => Server | Promise<Server>,
	options: McpHandlerOptions = {},
): McpHandler {
	const transports = new Map<
		string,
		WebStandardStreamableHTTPServerTransport
	>();

	async function createTransport(): Promise<WebStandardStreamableHTTPServerTransport> {
		const server = await createServer();
		let transport: WebStandardStreamableHTTPServerTransport;
		transport = new WebStandardStreamableHTTPServerTransport({
			sessionIdGenerator: () => crypto.randomUUID(),
			enableJsonResponse: options.enableJsonResponse ?? true,
			onsessioninitialized: (sessionId) => {
				transports.set(sessionId, transport);
			},
			onsessionclosed: async (sessionId) => {
				transports.delete(sessionId);
				await server.close();
			},
		});
		await server.connect(transport);
		return transport;
	}

	return async (request) => {
		const sessionId = request.headers.get("mcp-session-id");
		const transport =
			(sessionId === null ? undefined : transports.get(sessionId)) ??
			(await createTransport());
		return transport.handleRequest(request);
	};
}

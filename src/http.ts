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
	 * Defaults to true for a simple request/response Fetch handler.
	 */
	readonly enableJsonResponse?: boolean;
}

interface Session<Server extends McpHttpServerConnection> {
	readonly server: Server;
	readonly transport: WebStandardStreamableHTTPServerTransport;
}

function mcpError(status: number, code: number, message: string): Response {
	return Response.json(
		{
			jsonrpc: "2.0",
			error: { code, message },
			id: null,
		},
		{ status },
	);
}

async function isInitializeRequest(request: Request): Promise<boolean> {
	if (request.method !== "POST") {
		return false;
	}

	try {
		const body: unknown = await request.clone().json();
		return (
			typeof body === "object" &&
			body !== null &&
			"method" in body &&
			body.method === "initialize"
		);
	} catch {
		return false;
	}
}

/**
 * Creates a Fetch-compatible Streamable HTTP handler with SDK-managed sessions.
 *
 * Each stateful MCP session receives its own compiled server and official Web
 * Standard transport. The adapter routes sessions before delegating valid MCP
 * traffic, HTTP methods, JSON-RPC framing, and lifecycle behavior to the SDK.
 */
export function createMcpHandler<Server extends McpHttpServerConnection>(
	createServer: () => Server | Promise<Server>,
	options: McpHandlerOptions = {},
): McpHandler {
	const sessions = new Map<string, Session<Server>>();

	async function createSession(): Promise<Session<Server>> {
		const server = await createServer();
		let session: Session<Server>;
		const transport = new WebStandardStreamableHTTPServerTransport({
			sessionIdGenerator: () => crypto.randomUUID(),
			enableJsonResponse: options.enableJsonResponse ?? true,
			onsessioninitialized: (sessionId) => {
				sessions.set(sessionId, session);
			},
			onsessionclosed: async (sessionId) => {
				sessions.delete(sessionId);
				await server.close();
			},
		});
		session = { server, transport };
		await server.connect(transport);
		return session;
	}

	return async (request) => {
		const sessionId = request.headers.get("mcp-session-id");
		if (sessionId !== null) {
			const session = sessions.get(sessionId);
			return session === undefined
				? mcpError(404, -32001, "Session not found")
				: session.transport.handleRequest(request);
		}

		if (request.method !== "POST") {
			return new Response(null, { status: 405 });
		}
		if (!(await isInitializeRequest(request))) {
			return mcpError(400, -32000, "Mcp-Session-Id header is required");
		}

		const session = await createSession();
		const response = await session.transport.handleRequest(request);
		if (session.transport.sessionId === undefined) {
			await session.server.close();
		}
		return response;
	};
}

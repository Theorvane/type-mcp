import type {
	McpRequestContext,
	McpServer as SdkMcpServer,
	Server as SdkServer,
} from "@modelcontextprotocol/server";
import {
	createMcpHandler as createSdkMcpHandler,
	isLegacyRequest,
	WebStandardStreamableHTTPServerTransport,
} from "@modelcontextprotocol/server";

export type McpHttpServerConnection = SdkMcpServer | SdkServer;

export type McpHttpServerFactory = (
	context: McpRequestContext,
) => McpHttpServerConnection | Promise<McpHttpServerConnection>;

export type McpHandler = (request: Request) => Promise<Response>;

export interface McpHandlerOptions {
	/**
	 * Returns JSON responses instead of SSE streams for request/response MCP calls.
	 * Defaults to true for a simple request/response Fetch handler.
	 */
	readonly enableJsonResponse?: boolean;
}

interface Session {
	readonly server: McpHttpServerConnection;
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
export function createMcpHandler(
	createServer: McpHttpServerFactory,
	options: McpHandlerOptions = {},
): McpHandler {
	const sessions = new Map<string, Session>();
	const modern = createSdkMcpHandler(createServer, {
		legacy: "reject",
		responseMode: (options.enableJsonResponse ?? true) ? "json" : "sse",
	});

	async function createSession(request: Request): Promise<Session> {
		const server = await createServer({ era: "legacy", requestInfo: request });
		let session: Session;
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
		try {
			await server.connect(transport);
		} catch (error) {
			try {
				await server.close();
			} catch {
				// Preserve the original transport connection failure.
			}
			throw error;
		}
		return session;
	}

	const legacy: McpHandler = async (request) => {
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

		const session = await createSession(request);
		try {
			const response = await session.transport.handleRequest(request);
			if (response.status < 400) {
				return response;
			}
			const sessionId = session.transport.sessionId;
			if (sessionId !== undefined) {
				sessions.delete(sessionId);
			}
			await session.server.close();
			return response;
		} catch (error) {
			const sessionId = session.transport.sessionId;
			if (sessionId !== undefined) {
				sessions.delete(sessionId);
			}
			await session.server.close();
			throw error;
		}
	};

	return async (request) =>
		(await isLegacyRequest(request)) ? legacy(request) : modern.fetch(request);
}

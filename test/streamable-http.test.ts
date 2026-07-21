import { describe, expect, it } from "vitest";
import { z } from "zod";
import { createMcpHandler } from "../src/http.js";
import { createMcpServer, McpServer, McpTool } from "../src/index.js";

interface JsonRpcResponse {
	readonly jsonrpc: "2.0";
	readonly id: number;
	readonly result?: unknown;
}

function request(
	method: string,
	body?: unknown,
	sessionId?: string,
	protocolVersion?: string,
): Request {
	return new Request("https://example.test/mcp", {
		method,
		headers: {
			accept: "application/json, text/event-stream",
			...(body === undefined ? {} : { "content-type": "application/json" }),
			...(sessionId === undefined
				? {}
				: {
						"mcp-protocol-version": protocolVersion ?? "2025-11-25",
						"mcp-session-id": sessionId,
					}),
		},
		body: body === undefined ? undefined : JSON.stringify(body),
	});
}

async function json(response: Response): Promise<JsonRpcResponse> {
	return (await response.json()) as JsonRpcResponse;
}

function hasProtocolVersion(
	result: unknown,
): result is { readonly protocolVersion: string } {
	return (
		typeof result === "object" &&
		result !== null &&
		"protocolVersion" in result &&
		typeof result.protocolVersion === "string"
	);
}

function methodContext(
	name: string,
	metadata: DecoratorMetadata,
): ClassMethodDecoratorContext {
	return {
		kind: "method",
		name,
		static: false,
		private: false,
		access: {
			has: () => true,
			get: () => () => undefined,
		},
		metadata,
		addInitializer: () => undefined,
	};
}

function classContext(metadata: DecoratorMetadata): ClassDecoratorContext {
	return {
		kind: "class",
		name: "HttpTestServer",
		metadata,
		addInitializer: () => undefined,
	};
}

function createDecoratedServerClass() {
	class HttpTestServer {
		public echo(input: { readonly message: string }): string {
			return input.message;
		}
	}

	const metadata: DecoratorMetadata = {};
	McpTool({ input: z.object({ message: z.string() }) })(
		HttpTestServer.prototype.echo,
		methodContext("echo", metadata),
	);
	McpServer({ name: "http-test", version: "1.0.0" })(
		HttpTestServer,
		classContext(metadata),
	);
	return HttpTestServer;
}

describe("Fetch Streamable HTTP handler", () => {
	it("initializes and calls a decorated tool through the SDK transport", async () => {
		const handler = await createMcpHandler(() =>
			createMcpServer(createDecoratedServerClass()),
		);

		const initialize = await handler(
			request("POST", {
				jsonrpc: "2.0",
				id: 1,
				method: "initialize",
				params: {
					protocolVersion: "2025-11-25",
					capabilities: {},
					clientInfo: { name: "test-client", version: "1.0.0" },
				},
			}),
		);

		expect(initialize.status).toBe(200);
		const initialized = await json(initialize);
		expect(initialized.result).toMatchObject({
			serverInfo: { name: "http-test" },
		});
		expect(hasProtocolVersion(initialized.result)).toBe(true);
		if (!hasProtocolVersion(initialized.result)) {
			throw new Error(
				"MCP initialization did not negotiate a protocol version",
			);
		}
		const sessionId = initialize.headers.get("mcp-session-id");
		expect(sessionId).not.toBeNull();
		const protocolVersion = initialized.result.protocolVersion;

		const tools = await handler(
			request(
				"POST",
				{
					jsonrpc: "2.0",
					id: 2,
					method: "tools/list",
				},
				sessionId ?? undefined,
				protocolVersion,
			),
		);

		expect(tools.status).toBe(200);
		expect((await json(tools)).result).toMatchObject({
			tools: [expect.objectContaining({ name: "echo" })],
		});

		const call = await handler(
			request(
				"POST",
				{
					jsonrpc: "2.0",
					id: 3,
					method: "tools/call",
					params: { name: "echo", arguments: { message: "hello" } },
				},
				sessionId ?? undefined,
				protocolVersion,
			),
		);

		expect(call.status).toBe(200);
		expect((await json(call)).result).toMatchObject({
			content: [{ type: "text", text: "hello" }],
		});

		const terminated = await handler(
			request("DELETE", undefined, sessionId ?? undefined, protocolVersion),
		);
		expect(terminated.status).toBe(200);

		const restarted = await handler(
			request("POST", {
				jsonrpc: "2.0",
				id: 4,
				method: "initialize",
				params: {
					protocolVersion: "2025-11-25",
					capabilities: {},
					clientInfo: { name: "next-client", version: "1.0.0" },
				},
			}),
		);
		expect(restarted.status).toBe(200);
		expect(restarted.headers.get("mcp-session-id")).not.toBe(sessionId);
	});

	it("does not allocate a server for unsupported or unknown-session requests", async () => {
		let created = 0;
		let closed = 0;
		const handler = createMcpHandler(() => {
			created += 1;
			return {
				async connect(): Promise<void> {},
				async close(): Promise<void> {
					closed += 1;
				},
			};
		});

		const unsupported = await handler(request("PUT"));
		expect(unsupported.status).toBe(405);
		expect(created).toBe(0);

		const unknownSession = await handler(
			request(
				"POST",
				{ jsonrpc: "2.0", id: 1, method: "tools/list" },
				"unknown-session",
				"2025-11-25",
			),
		);
		expect(unknownSession.status).toBe(404);
		expect(created).toBe(0);
		expect(closed).toBe(0);
	});

	it("delegates unsupported methods to the SDK transport after session routing", async () => {
		const handler = createMcpHandler(() =>
			createMcpServer(createDecoratedServerClass()),
		);

		const response = await handler(request("PUT"));

		expect(response.status).toBe(405);
	});
});

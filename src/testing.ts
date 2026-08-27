import { Client, InMemoryTransport } from "@modelcontextprotocol/client";
import type { Implementation, McpServer } from "@modelcontextprotocol/server";

export interface McpTestSessionOptions {
	readonly client?: Readonly<Implementation> | undefined;
}

export interface McpTestSession {
	readonly client: Client;
	readonly server: McpServer;
	close(): Promise<void>;
}

export async function createMcpTestSession(
	serverValue: McpServer | Promise<McpServer>,
	options: McpTestSessionOptions = {},
): Promise<McpTestSession> {
	const server = await serverValue;
	const client = new Client(
		options.client ?? { name: "type-mcp-test-client", version: "1.0.0" },
	);
	const [clientTransport, serverTransport] =
		InMemoryTransport.createLinkedPair();

	try {
		await Promise.all([
			client.connect(clientTransport),
			server.connect(serverTransport),
		]);
	} catch (error) {
		await Promise.allSettled([client.close(), server.close()]);
		throw error;
	}

	let closed = false;
	return Object.freeze({
		client,
		server,
		async close(): Promise<void> {
			if (closed) {
				return;
			}
			closed = true;
			const results = await Promise.allSettled([
				client.close(),
				server.close(),
			]);
			const failures = results
				.filter(
					(result): result is PromiseRejectedResult =>
						result.status === "rejected",
				)
				.map((result) => result.reason);
			if (failures.length > 0) {
				throw new AggregateError(failures, "Failed to close MCP test session");
			}
		},
	});
}

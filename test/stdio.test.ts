import { Client } from "@modelcontextprotocol/client";
import type { Transport } from "@modelcontextprotocol/server";
import { InMemoryTransport, McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { describe, expect, it } from "vitest";
import {
	type McpServerConnection,
	type StdioServerOptions,
	serveStdioServer,
	startStdioServer,
} from "../src/index.js";

describe("stdio server helper", () => {
	it("creates one injected transport and connects it to the server exactly once", async () => {
		const connected: Transport[] = [];
		const server: McpServerConnection = {
			async connect(transport) {
				connected.push(transport);
			},
		};
		const [transport] = InMemoryTransport.createLinkedPair();
		let factoryCalls = 0;
		const options: StdioServerOptions = {
			transportFactory: () => {
				factoryCalls += 1;
				return transport;
			},
		};

		const result = await startStdioServer(server, options);

		expect(factoryCalls).toBe(1);
		expect(connected).toEqual([transport]);
		expect(result).toEqual({ server, transport });
	});

	it("negotiates the 2026 protocol from a server factory", async () => {
		const [clientTransport, serverTransport] =
			InMemoryTransport.createLinkedPair();
		let factoryCalls = 0;
		const handle = serveStdioServer(
			() => {
				factoryCalls += 1;
				return new McpServer({ name: "stdio-modern", version: "1.0.0" });
			},
			{ transport: serverTransport },
		);
		const client = new Client(
			{ name: "stdio-test-client", version: "1.0.0" },
			{ versionNegotiation: { mode: { pin: "2026-07-28" } } },
		);

		await client.connect(clientTransport);
		expect(client.getServerVersion()).toMatchObject({
			name: "stdio-modern",
			version: "1.0.0",
		});
		expect(factoryCalls).toBe(1);

		await client.close();
		await handle.close();
	});

	it("uses the official SDK transport by default", async () => {
		const connected: Transport[] = [];
		const server: McpServerConnection = {
			async connect(transport) {
				connected.push(transport);
			},
		};

		const result = await startStdioServer(server);

		expect(result.transport).toBeInstanceOf(StdioServerTransport);
		expect(connected).toEqual([result.transport]);
	});
});

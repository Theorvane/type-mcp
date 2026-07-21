import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { describe, expect, it } from "vitest";
import {
	type McpServerConnection,
	type StdioServerOptions,
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

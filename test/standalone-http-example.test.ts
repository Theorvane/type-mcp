import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

import { beforeAll, describe, expect, it } from "vitest";

interface JsonRpcResponse {
	readonly jsonrpc: "2.0";
	readonly id: number;
	readonly result?: unknown;
}

type McpHandler = (request: Request) => Promise<Response>;

let handler: McpHandler;

function request(
	body: unknown,
	sessionId?: string,
	protocolVersion?: string,
): Request {
	return new Request("https://example.test/mcp", {
		method: "POST",
		headers: {
			accept: "application/json, text/event-stream",
			"content-type": "application/json",
			...(sessionId === undefined
				? {}
				: {
						"mcp-protocol-version": protocolVersion ?? "2025-11-25",
						"mcp-session-id": sessionId,
					}),
		},
		body: JSON.stringify(body),
	});
}

async function json(response: Response): Promise<JsonRpcResponse> {
	return (await response.json()) as JsonRpcResponse;
}

function protocolVersion(result: unknown): string {
	if (
		typeof result !== "object" ||
		result === null ||
		!("protocolVersion" in result) ||
		typeof result.protocolVersion !== "string"
	) {
		throw new Error(
			"Example initialization did not negotiate a protocol version",
		);
	}
	return result.protocolVersion;
}

beforeAll(async () => {
	execFileSync("npm", ["run", "build"], { stdio: "pipe" });
	execFileSync("npm", ["--prefix", "examples/standalone-http", "ci"], {
		stdio: "pipe",
	});
	execFileSync(
		"npm",
		["--prefix", "examples/standalone-http", "run", "build"],
		{
			stdio: "pipe",
		},
	);
	const module = await import(
		pathToFileURL("examples/standalone-http/dist/server.js").href
	);
	handler = module.handler as McpHandler;
});

describe("standalone HTTP example", () => {
	it("initializes, lists, and calls its documented tool without a network listener", async () => {
		const initialized = await handler(
			request({
				jsonrpc: "2.0",
				id: 1,
				method: "initialize",
				params: {
					protocolVersion: "2025-11-25",
					capabilities: {},
					clientInfo: { name: "example-smoke", version: "1.0.0" },
				},
			}),
		);
		expect(initialized.status).toBe(200);
		const initializeResult = await json(initialized);
		expect(initializeResult.result).toMatchObject({
			serverInfo: { name: "catalog-example" },
		});
		const sessionId = initialized.headers.get("mcp-session-id");
		expect(sessionId).not.toBeNull();
		const negotiatedVersion = protocolVersion(initializeResult.result);

		const listed = await handler(
			request(
				{ jsonrpc: "2.0", id: 2, method: "tools/list" },
				sessionId ?? undefined,
				negotiatedVersion,
			),
		);
		expect((await json(listed)).result).toMatchObject({
			tools: [expect.objectContaining({ name: "find-product" })],
		});

		const called = await handler(
			request(
				{
					jsonrpc: "2.0",
					id: 3,
					method: "tools/call",
					params: { name: "find-product", arguments: { sku: "SKU-42" } },
				},
				sessionId ?? undefined,
				negotiatedVersion,
			),
		);
		expect((await json(called)).result).toMatchObject({
			content: [{ type: "text", text: "Product SKU-42 is available." }],
		});
	});
});

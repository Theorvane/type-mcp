import { McpServer as SdkMcpServer } from "@modelcontextprotocol/server";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { createMcpServer, McpServer, McpTool } from "../src/index.js";
import { createMcpTestSession } from "../src/testing.js";

function methodContext(
	name: string,
	metadata: DecoratorMetadata,
): ClassMethodDecoratorContext {
	return {
		kind: "method",
		name,
		static: false,
		private: false,
		access: { has: () => true, get: () => () => undefined },
		metadata,
		addInitializer: () => undefined,
	};
}

function classContext(metadata: DecoratorMetadata): ClassDecoratorContext {
	return {
		kind: "class",
		name: "TestServer",
		metadata,
		addInitializer: () => undefined,
	};
}

describe("MCP testing helper", () => {
	it("connects a real SDK client to a compiled server in memory", async () => {
		class TestServer {
			echo(input: { readonly value: string }): string {
				return input.value;
			}
		}
		const metadata: DecoratorMetadata = {};
		McpTool({ input: z.object({ value: z.string() }) })(
			TestServer.prototype.echo,
			methodContext("echo", metadata),
		);
		McpServer({ name: "testing-helper", version: "1.0.0" })(
			TestServer,
			classContext(metadata),
		);

		const session = await createMcpTestSession(createMcpServer(TestServer));
		const listed = await session.client.listTools();
		const result = await session.client.callTool({
			name: "echo",
			arguments: { value: "connected" },
		});

		expect(listed.tools.map((tool) => tool.name)).toEqual(["echo"]);
		expect(result).toMatchObject({
			content: [{ type: "text", text: "connected" }],
		});

		await session.close();
		await session.close();
	});

	it("closes the server when an in-memory connection fails", async () => {
		const server = new SdkMcpServer({
			name: "failed-test-server",
			version: "1.0.0",
		});
		const failure = new Error("connect failed");
		vi.spyOn(server, "connect").mockRejectedValue(failure);
		const close = vi.spyOn(server, "close");

		await expect(createMcpTestSession(server)).rejects.toBe(failure);
		expect(close).toHaveBeenCalledOnce();
	});
});

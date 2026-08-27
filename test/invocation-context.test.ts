import { Client, InMemoryTransport } from "@modelcontextprotocol/client";
import type {
	McpServer as McpSdkServer,
	Progress,
} from "@modelcontextprotocol/server";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
	createMcpServer,
	type McpInvocationContext,
	McpPrompt,
	McpResource,
	McpServer,
	McpTool,
} from "../src/index.js";

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
		name: "ContextServer",
		metadata,
		addInitializer: () => undefined,
	};
}

async function connect(serverPromise: Promise<McpSdkServer>) {
	const server = await serverPromise;
	const client = new Client({ name: "context-client", version: "1.0.0" });
	const [clientTransport, serverTransport] =
		InMemoryTransport.createLinkedPair();
	await Promise.all([
		client.connect(clientTransport),
		server.connect(serverTransport),
	]);
	return { client, server };
}

describe("MCP invocation context", () => {
	it("exposes request identity and reports related progress", async () => {
		let observed: McpInvocationContext | undefined;
		class ContextServer {
			public async run(
				_input: Record<string, never>,
				context: McpInvocationContext,
			): Promise<string> {
				observed = context;
				await context.reportProgress(1, 2, "halfway");
				return "done";
			}
		}

		const metadata: DecoratorMetadata = {};
		McpTool({ input: z.object({}) })(
			ContextServer.prototype.run,
			methodContext("run", metadata),
		);
		McpServer({ name: "context", version: "1.0.0" })(
			ContextServer,
			classContext(metadata),
		);

		const { client, server } = await connect(createMcpServer(ContextServer));
		const withoutProgress = await client.callTool({
			name: "run",
			arguments: {},
		});
		expect(withoutProgress).toMatchObject({
			content: [{ type: "text", text: "done" }],
		});

		const progress: Progress[] = [];
		const result = await client.callTool(
			{ name: "run", arguments: {} },
			{ onprogress: (update) => progress.push(update) },
		);

		expect(result).toMatchObject({
			content: [{ type: "text", text: "done" }],
		});
		expect(observed?.requestId).toBeDefined();
		expect(observed?.signal).toBeInstanceOf(AbortSignal);
		expect(progress).toEqual([{ progress: 1, total: 2, message: "halfway" }]);

		await Promise.all([client.close(), server.close()]);
	});

	it("passes context to resources and prompts as their final argument", async () => {
		const observed: Partial<
			Record<
				"static" | "template" | "prompt" | "promptArgs",
				McpInvocationContext
			>
		> = {};
		class ContextServer {
			public staticResource(context: McpInvocationContext): string {
				observed.static = context;
				return "static";
			}

			public templateResource(
				input: { readonly slug: string },
				context: McpInvocationContext,
			): string {
				observed.template = context;
				return input.slug;
			}

			public prompt(context: McpInvocationContext): string {
				observed.prompt = context;
				return "hello";
			}

			public promptArgs(
				input: { readonly topic: string },
				context: McpInvocationContext,
			): string {
				observed.promptArgs = context;
				return input.topic;
			}
		}

		const metadata: DecoratorMetadata = {};
		McpResource({ uri: "memo://static" })(
			ContextServer.prototype.staticResource,
			methodContext("staticResource", metadata),
		);
		McpResource({
			uri: "memo://{slug}",
			input: z.object({ slug: z.string() }),
		})(
			ContextServer.prototype.templateResource,
			methodContext("templateResource", metadata),
		);
		McpPrompt({})(
			ContextServer.prototype.prompt,
			methodContext("prompt", metadata),
		);
		McpPrompt({ args: z.object({ topic: z.string() }) })(
			ContextServer.prototype.promptArgs,
			methodContext("promptArgs", metadata),
		);
		McpServer({ name: "context-kinds", version: "1.0.0" })(
			ContextServer,
			classContext(metadata),
		);

		const { client, server } = await connect(createMcpServer(ContextServer));
		await client.readResource({ uri: "memo://static" });
		await client.readResource({ uri: "memo://example" });
		await client.getPrompt({ name: "prompt" });
		await client.getPrompt({
			name: "promptArgs",
			arguments: { topic: "context" },
		});

		expect(Object.keys(observed).sort()).toEqual([
			"prompt",
			"promptArgs",
			"static",
			"template",
		]);
		for (const context of Object.values(observed)) {
			expect(context?.requestId).toBeDefined();
			expect(context?.signal).toBeInstanceOf(AbortSignal);
			expect(Object.isFrozen(context)).toBe(true);
		}

		await Promise.all([client.close(), server.close()]);
	});

	it("propagates client cancellation through the invocation signal", async () => {
		let observedSignal: AbortSignal | undefined;
		let markStarted: (() => void) | undefined;
		const started = new Promise<void>((resolve) => {
			markStarted = resolve;
		});
		class ContextServer {
			public async wait(
				_input: Record<string, never>,
				context: McpInvocationContext,
			): Promise<string> {
				observedSignal = context.signal;
				markStarted?.();
				await new Promise<void>((resolve) => {
					if (context.signal.aborted) {
						resolve();
						return;
					}
					context.signal.addEventListener("abort", () => resolve(), {
						once: true,
					});
				});
				return "cancelled";
			}
		}

		const metadata: DecoratorMetadata = {};
		McpTool({ input: z.object({}) })(
			ContextServer.prototype.wait,
			methodContext("wait", metadata),
		);
		McpServer({ name: "context-cancellation", version: "1.0.0" })(
			ContextServer,
			classContext(metadata),
		);

		const { client, server } = await connect(createMcpServer(ContextServer));
		const controller = new AbortController();
		const request = client.callTool(
			{ name: "wait", arguments: {} },
			{ signal: controller.signal },
		);
		await started;
		controller.abort();
		await request.catch(() => undefined);

		expect(observedSignal?.aborted).toBe(true);

		await Promise.all([client.close(), server.close()]);
	});
});

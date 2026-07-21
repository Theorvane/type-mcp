import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import type { McpServer as McpSdkServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	GetPromptResultSchema,
	ListPromptsResultSchema,
	ListResourcesResultSchema,
	ReadResourceResultSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { describe, expect, it } from "vitest";
import {
	createMcpServer,
	McpPrompt,
	McpResource,
	McpServer,
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
		name: "CatalogServer",
		metadata,
		addInitializer: () => undefined,
	};
}

async function connect(serverPromise: Promise<McpSdkServer>) {
	const server = await serverPromise;
	const client = new Client({ name: "test-client", version: "1.0.0" });
	const [clientTransport, serverTransport] =
		InMemoryTransport.createLinkedPair();
	await Promise.all([
		client.connect(clientTransport),
		server.connect(serverTransport),
	]);
	return { client, server };
}

describe("decorated resource and prompt compilation", () => {
	it("lists and reads a static resource from its decorated instance method", async () => {
		let readCount = 0;

		class CatalogServer {
			public readConfig(): { region: string } {
				readCount += 1;
				return { region: "ap-northeast-2" };
			}
		}

		const metadata: DecoratorMetadata = {};
		McpResource({
			description: "Catalog configuration.",
			mimeType: "application/json",
			name: "catalog-config",
			uri: "config://catalog",
		})(
			CatalogServer.prototype.readConfig,
			methodContext("readConfig", metadata),
		);
		McpServer({ name: "catalog", version: "1.0.0" })(
			CatalogServer,
			classContext(metadata),
		);

		const { client, server } = await connect(createMcpServer(CatalogServer));
		const resources = await client.request(
			{ method: "resources/list" },
			ListResourcesResultSchema,
		);
		const result = await client.request(
			{ method: "resources/read", params: { uri: "config://catalog" } },
			ReadResourceResultSchema,
		);

		expect(resources.resources).toContainEqual(
			expect.objectContaining({
				name: "catalog-config",
				description: "Catalog configuration.",
				mimeType: "application/json",
				uri: "config://catalog",
			}),
		);
		expect(result.contents).toEqual([
			{
				mimeType: "application/json",
				text: '{"region":"ap-northeast-2"}',
				uri: "config://catalog",
			},
		]);
		expect(readCount).toBe(1);

		await Promise.all([client.close(), server.close()]);
	});

	it("lists and gets synchronous and asynchronous decorated prompts", async () => {
		class PromptServer {
			public welcome() {
				return "Welcome to the catalog.";
			}

			public async farewell() {
				return "Thanks for visiting.";
			}
		}

		const metadata: DecoratorMetadata = {};
		McpPrompt({ description: "Creates a welcome message." })(
			PromptServer.prototype.welcome,
			methodContext("welcome", metadata),
		);
		McpPrompt({ description: "Creates a farewell message." })(
			PromptServer.prototype.farewell,
			methodContext("farewell", metadata),
		);
		McpServer({ name: "prompts", version: "1.0.0" })(
			PromptServer,
			classContext(metadata),
		);

		const { client, server } = await connect(createMcpServer(PromptServer));
		const prompts = await client.request(
			{ method: "prompts/list" },
			ListPromptsResultSchema,
		);
		const welcome = await client.request(
			{ method: "prompts/get", params: { name: "welcome", arguments: {} } },
			GetPromptResultSchema,
		);
		const farewell = await client.request(
			{ method: "prompts/get", params: { name: "farewell", arguments: {} } },
			GetPromptResultSchema,
		);

		expect(prompts.prompts).toContainEqual(
			expect.objectContaining({
				name: "welcome",
				description: "Creates a welcome message.",
			}),
		);
		expect(prompts.prompts).toContainEqual(
			expect.objectContaining({
				name: "farewell",
				description: "Creates a farewell message.",
			}),
		);
		expect(welcome.messages).toEqual([
			{
				role: "user",
				content: { type: "text", text: "Welcome to the catalog." },
			},
		]);
		expect(farewell.messages).toEqual([
			{ role: "user", content: { type: "text", text: "Thanks for visiting." } },
		]);

		await Promise.all([client.close(), server.close()]);
	});

	it("preserves SDK-valid resource and prompt results", async () => {
		class StructuredServer {
			public readGuide() {
				return {
					contents: [
						{ uri: "guide://catalog", text: "Overview" },
						{
							uri: "guide://catalog/chapter-1",
							mimeType: "text/markdown",
							text: "# Chapter 1",
						},
					],
				};
			}

			public buildGuide() {
				return {
					description: "Catalog guide",
					messages: [
						{
							role: "assistant",
							content: { type: "text", text: "Start with the overview." },
						},
						{
							role: "user",
							content: { type: "text", text: "Then read chapter one." },
						},
					],
				};
			}
		}

		const metadata: DecoratorMetadata = {};
		McpResource({ uri: "guide://catalog" })(
			StructuredServer.prototype.readGuide,
			methodContext("readGuide", metadata),
		);
		McpPrompt({})(
			StructuredServer.prototype.buildGuide,
			methodContext("buildGuide", metadata),
		);
		McpServer({ name: "structured", version: "1.0.0" })(
			StructuredServer,
			classContext(metadata),
		);

		const { client, server } = await connect(createMcpServer(StructuredServer));
		const resource = await client.request(
			{ method: "resources/read", params: { uri: "guide://catalog" } },
			ReadResourceResultSchema,
		);
		const prompt = await client.request(
			{ method: "prompts/get", params: { name: "buildGuide", arguments: {} } },
			GetPromptResultSchema,
		);

		expect(resource).toEqual({
			contents: [
				{ uri: "guide://catalog", text: "Overview" },
				{
					uri: "guide://catalog/chapter-1",
					mimeType: "text/markdown",
					text: "# Chapter 1",
				},
			],
		});
		expect(prompt).toEqual({
			description: "Catalog guide",
			messages: [
				{
					role: "assistant",
					content: { type: "text", text: "Start with the overview." },
				},
				{
					role: "user",
					content: { type: "text", text: "Then read chapter one." },
				},
			],
		});

		await Promise.all([client.close(), server.close()]);
	});

	it("hides resource and prompt handler failure details", async () => {
		class FailureServer {
			public failResource(): never {
				throw new Error("resource secret must not be exposed");
			}

			public failPrompt(): never {
				throw new Error("prompt secret must not be exposed");
			}
		}

		const metadata: DecoratorMetadata = {};
		McpResource({ uri: "config://failure" })(
			FailureServer.prototype.failResource,
			methodContext("failResource", metadata),
		);
		McpPrompt({})(
			FailureServer.prototype.failPrompt,
			methodContext("failPrompt", metadata),
		);
		McpServer({ name: "failures", version: "1.0.0" })(
			FailureServer,
			classContext(metadata),
		);

		const { client, server } = await connect(createMcpServer(FailureServer));
		const resource = await client.request(
			{ method: "resources/read", params: { uri: "config://failure" } },
			ReadResourceResultSchema,
		);
		const prompt = await client.request(
			{ method: "prompts/get", params: { name: "failPrompt", arguments: {} } },
			GetPromptResultSchema,
		);

		expect(resource.contents).toEqual([
			{ uri: "config://failure", text: "Resource execution failed" },
		]);
		expect(prompt.messages).toEqual([
			{
				role: "user",
				content: { type: "text", text: "Prompt execution failed" },
			},
		]);
		expect(JSON.stringify({ resource, prompt })).not.toContain("secret");

		await Promise.all([client.close(), server.close()]);
	});
});

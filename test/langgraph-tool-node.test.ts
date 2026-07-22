import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

import { AIMessage, ToolMessage } from "@langchain/core/messages";
import { describe, expect, it, beforeAll } from "vitest";

interface LangGraphExampleModule {
	createCatalogToolNode(): Promise<{
		invoke(input: unknown): Promise<{ readonly messages: readonly unknown[] }>;
	}>;
}

let createCatalogToolNode: LangGraphExampleModule["createCatalogToolNode"];

beforeAll(async () => {
	execFileSync("npm", ["run", "build"], { stdio: "pipe" });
	execFileSync("npm", ["--prefix", "examples/langgraph-tools", "ci"], {
		stdio: "pipe",
	});
	execFileSync(
		"npm",
		["--prefix", "examples/langgraph-tools", "run", "build"],
		{ stdio: "pipe" },
	);
	const module = (await import(
		pathToFileURL("examples/langgraph-tools/dist/server.js").href
	)) as LangGraphExampleModule;
	createCatalogToolNode = module.createCatalogToolNode;
});

describe("LangGraph ToolNode example", () => {
	it("executes an adapter-generated tool without a model, listener, or network request", async () => {
		const toolNode = await createCatalogToolNode();
		const result = await toolNode.invoke({
			messages: [
				new AIMessage({
					content: "",
					tool_calls: [
						{
							id: "call-catalog-1",
							name: "find-product",
							args: { sku: "SKU-7" },
							type: "tool_call",
						},
					],
				}),
			],
		});

		const [message] = result.messages;
		expect(message).toBeInstanceOf(ToolMessage);
		expect(message).toMatchObject({
			content: "Product SKU-7 is available.",
			name: "find-product",
			tool_call_id: "call-catalog-1",
		});
	});
});

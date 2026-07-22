import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

const currentFacingDocuments = [
	"../README.md",
	"../AGENTS.md",
	"../CONTRIBUTING.md",
	"../docs/product/vision.md",
	"../docs/product/mvp-scope.md",
	"../docs/api/decorator-api.md",
	"../docs/architecture/overview.md",
	"../docs/guides/agent-integration.md",
	"../docs/guides/getting-started.md",
	"../docs/README.md",
];

describe("LangChain current-facing documentation contract", () => {
	it("documents the tools-only LangChain and consumer-owned LangGraph path without a NestJS roadmap", async () => {
		const documents = await Promise.all(
			currentFacingDocuments.map((path) =>
				readFile(new URL(path, import.meta.url), "utf8"),
			),
		);
		const langchainGuide = await readFile(
			new URL("../docs/guides/langchain-langgraph.md", import.meta.url),
			"utf8",
		);
		const combined = documents.join("\n");

		expect(combined).toContain("type-mcp/langchain");
		expect(combined).toContain("LangGraph");
		expect(combined).not.toMatch(/future NestJS|NestJS integration|ModuleRef/i);
		expect(langchainGuide).toContain("@langchain/core");
		expect(langchainGuide).toContain("tools only");
		expect(langchainGuide).toContain("consumer");
	});
});

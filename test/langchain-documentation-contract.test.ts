import { readdir, readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

const trackedDocumentationRoots = [
	"../README.md",
	"../AGENTS.md",
	"../CONTRIBUTING.md",
	"../docs",
	"../.agents",
	"../.agent",
	"../.github",
];

async function readTrackedDocumentation(path: URL): Promise<readonly string[]> {
	const entry = await readdir(path, { withFileTypes: true });
	const nested = await Promise.all(
		entry.map(async (item) => {
			const child = new URL(
				`${item.name}${item.isDirectory() ? "/" : ""}`,
				path,
			);
			if (item.isDirectory()) return readTrackedDocumentation(child);
			if (/\.(?:md|ya?ml)$/i.test(item.name))
				return [await readFile(child, "utf8")];
			return [];
		}),
	);
	return nested.flat();
}

const currentFacingDocuments = [
	"../README.md",
	"../AGENTS.md",
	"../CONTRIBUTING.md",
	"../SECURITY.md",
	"../docs/architecture/adr/0002-langchain-langgraph-integration.md",
	"../docs/product/vision.md",
	"../docs/product/mvp-scope.md",
	"../docs/api/decorator-api.md",
	"../docs/architecture/overview.md",
	"../docs/guides/agent-integration.md",
	"../docs/guides/configuration.md",
	"../docs/guides/getting-started.md",
	"../docs/guides/http-and-nextjs.md",
	"../docs/guides/langchain-langgraph.md",
	"../docs/README.md",
	"../examples/standalone-http/README.md",
	"../examples/langgraph-tools/README.md",
];

describe("LangChain current-facing documentation contract", () => {
	it("documents the tools-only LangChain and consumer-owned LangGraph integration boundary", async () => {
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

		const trackedDocumentation = (
			await Promise.all(
				trackedDocumentationRoots.map(async (root) => {
					const location = new URL(root, import.meta.url);
					return root.endsWith(".md")
						? [await readFile(location, "utf8")]
						: readTrackedDocumentation(new URL(`${root}/`, import.meta.url));
				}),
			)
		)
			.flat()
			.join("\n");

		expect(combined).toContain("@theorvane/type-mcp@0.2.0");
		expect(combined).toContain("@theorvane/type-mcp/langchain");
		expect(combined).toContain("LangGraph");
		expect(combined).not.toContain("`type-mcp");
		expect(combined).not.toContain('"type-mcp"');
		expect(combined).not.toMatch(
			/(?:metadata-only implementation|runtime validation and invocation are planned|createMcpServer\(\) remains a placeholder|createMcpHandler\(\) currently remains a placeholder|The following is planned behavior, not the current runtime implementation)/i,
		);
		expect(trackedDocumentation).not.toMatch(
			/n[e]st[j]s|@n[e]st[j]s|module[r]ef|discovery[s]ervice/i,
		);
		expect(langchainGuide).toContain("@langchain/core");
		expect(langchainGuide).toContain("tools only");
		expect(langchainGuide).toContain("consumer");
	});
});

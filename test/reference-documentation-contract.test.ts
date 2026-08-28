import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

const documents = [
	"docs/README.md",
	"docs/guides/core-concepts.md",
	"docs/guides/petstore-walkthrough.md",
] as const;

describe("reference-first TypeMCP documentation", () => {
	it("routes Petstore readers to every published runtime boundary without claiming application-owned behavior", async () => {
		const content = (
			await Promise.all(documents.map((path) => readFile(path, "utf8")))
		).join("\n");

		expect(content).toContain("@theorvane/type-mcp@0.4.0");
		expect(content).toContain("Inspect a declaration");
		expect(content).toContain("Run over stdio");
		expect(content).toContain("Serve Streamable HTTP");
		expect(content).toContain("Reuse tools with LangChain");
		expect(content).toContain("find-product");
		expect(content).toContain("createMcpServer");
		expect(content).toContain("InstanceResolver");
		expect(content).toContain(
			"hosting, authorization, persistence, models, LangGraph composition, and deployment",
		);
		expect(content).not.toMatch(
			/TypeMCP (?:chooses|owns) (?:a model|authorization|LangGraph)/i,
		);
	});

	it("requires the project-starting Petstore curriculum to preserve published resolver and application boundaries", async () => {
		const curriculumDocuments = [
			"docs/guides/petstore-project-setup.md",
			"docs/guides/petstore-typemcp-foundation.md",
			"docs/guides/petstore-walkthrough.md",
		] as const;
		const contents = await Promise.all(
			curriculumDocuments.map(async (path) => ({
				content: await readFile(path, "utf8"),
				path,
			})),
		);
		const allContent = contents.map(({ content }) => content).join("\n");
		const consumerScript = await readFile(
			"scripts/verify-documentation-consumer.mjs",
			"utf8",
		);

		for (const { content, path } of contents) {
			expect(content, path).toMatch(/## Before you start/);
			expect(content, path).toMatch(/## Workspace checkpoint/);
			expect(content, path).toMatch(/## Install/);
			expect(content, path).toMatch(/## Run and verify/);
			expect(content, path).toMatch(/## Expected behavior/);
			expect(content, path).toMatch(/## Failure guide/);
			expect(content, path).toMatch(/## Responsibility boundary/);
			expect(content, path).toMatch(/## Next steps/);
		}

		expect(allContent).toContain("@theorvane/type-mcp@0.4.0");
		expect(allContent).not.toMatch(/npm install @theorvane\/type-mcp(?:\s|$)/);
		expect(allContent).toContain("npm run stdio");
		expect(consumerScript).toContain(
			"packed clean consumer compiled documented Petstore foundation, HTTP handler, and LangChain adapter",
		);
		expect(allContent).toContain("Repository maintainers only");
		expect(allContent).toContain("createMcpServer(PetstoreServer, resolver)");
		expect(allContent).toContain("startStdioServer");
		expect(allContent).toContain("declare const petstoreClient");
		expect(allContent).toMatch(
			/hosting, authorization, persistence, models,.*deployment/i,
		);
		expect(allContent).not.toMatch(
			/TypeMCP (?:owns|chooses) (?:a model|authorization|deployment)/i,
		);
	});
});

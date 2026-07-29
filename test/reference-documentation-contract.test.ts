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

		expect(content).toContain("@theorvane/type-mcp@0.2.2");
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
});

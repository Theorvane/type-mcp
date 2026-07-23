import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

describe("LangChain publish verification contract", () => {
	it("requires every LangChain runtime and declaration artifact in the publish gate", async () => {
		const script = await readFile(
			new URL("../scripts/verify-publish-readiness.mjs", import.meta.url),
			"utf8",
		);

		expect(script).toContain('"dist/langchain.js"');
		expect(script).toContain('"dist/langchain.cjs"');
		expect(script).toContain('"dist/langchain.d.ts"');
	});
});

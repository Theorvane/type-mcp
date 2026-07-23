import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("release promotion workflow", () => {
	it("accepts only dev pull requests into main", async () => {
		const workflow = await readFile(
			".github/workflows/release-promotion.yml",
			"utf8",
		);
		expect(workflow).toMatch(/pull_request:\s*\n\s*branches: \[main\]/);
		expect(workflow).toContain("HEAD_REF: $" + "{{ github.head_ref }}");
		expect(workflow).toContain('test "$HEAD_REF" = "dev"');
	});
});

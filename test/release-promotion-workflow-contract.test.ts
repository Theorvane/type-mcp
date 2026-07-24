import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("release promotion workflow", () => {
	it("accepts dev or an issue-numbered release branch into main", async () => {
		const workflow = await readFile(
			".github/workflows/release-promotion.yml",
			"utf8",
		);
		expect(workflow).toMatch(/pull_request:\s*\n\s*branches: \[main\]/);
		expect(workflow).toContain("HEAD_REF: $" + "{{ github.head_ref }}");
		expect(workflow).toContain(
			'[[ "$HEAD_REF" == "dev" || "$HEAD_REF" =~ ^release/[1-9][0-9]*-[a-z0-9][a-z0-9-]*$ ]]',
		);
	});
});

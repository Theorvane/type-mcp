import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const workflowPaths = [
	".github/workflows/ci.yml",
	".github/workflows/enforce-reviewer-managed-pr-labels.yml",
	".github/workflows/request-ai-review.yml",
] as const;

describe("branch-governance workflows", () => {
	it("covers the dev integration branch and main release branch", async () => {
		for (const path of workflowPaths) {
			const workflow = await readFile(path, "utf8");
			expect(workflow).toContain("branches: [dev, main]");
		}
	});
});

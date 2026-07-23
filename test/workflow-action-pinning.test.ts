import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

const workflows = [
	"ci.yml",
	"publish.yml",
	"request-ai-review.yml",
	"enforce-reviewer-managed-pr-labels.yml",
];

describe("workflow action pinning", () => {
	it("uses immutable SHAs for every third-party action", async () => {
		const sources = await Promise.all(
			workflows.map((workflow) =>
				readFile(
					new URL(`../.github/workflows/${workflow}`, import.meta.url),
					"utf8",
				),
			),
		);

		for (const source of sources) {
			for (const action of source.matchAll(/^\s*uses:\s+[^\s@]+@([^\s#]+)/gm)) {
				expect(action[1]).toMatch(/^[a-f0-9]{40}$/);
			}
		}
	});
});

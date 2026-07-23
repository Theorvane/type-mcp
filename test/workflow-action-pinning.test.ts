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

		const actions = sources.flatMap((source) =>
			Array.from(
				source.matchAll(/^\s*(?:-\s*)?uses:\s+[^\s@]+@([^\s#]+)/gm),
				([, action]) => action,
			),
		);

		expect(actions).toHaveLength(6);
		for (const action of actions) {
			expect(action).toMatch(/^[a-f0-9]{40}$/);
		}
	});
});

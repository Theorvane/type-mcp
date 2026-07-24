import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

const releaseGuard =
	'[[ "$HEAD_REF" == "dev" || "$HEAD_REF" =~ ^release/[1-9][0-9]*-[a-z0-9]+(-[a-z0-9]+)*$ ]]';

function acceptsHeadRef(guard: string, headRef: string): boolean {
	return (
		spawnSync("bash", ["-c", guard], {
			env: { ...process.env, HEAD_REF: headRef },
		}).status === 0
	);
}

describe("release promotion workflow", () => {
	it("accepts dev or a strict issue-numbered release branch into main", async () => {
		const workflow = await readFile(
			".github/workflows/release-promotion.yml",
			"utf8",
		);
		expect(workflow).toMatch(/pull_request:\s*\n\s*branches: \[main\]/);
		expect(workflow).toContain("HEAD_REF: $" + "{{ github.head_ref }}");
		expect(workflow).toContain(releaseGuard);

		for (const accepted of ["dev", "release/83-published-020-docs"]) {
			expect(acceptsHeadRef(releaseGuard, accepted)).toBe(true);
		}
		for (const rejected of [
			"release/0-invalid",
			"release/01-invalid",
			"release/83-",
			"release/83-Uppercase",
			"release/83_unsafe",
			"release/83/path",
			"feature/83-published",
		]) {
			expect(acceptsHeadRef(releaseGuard, rejected)).toBe(false);
		}
	});
});

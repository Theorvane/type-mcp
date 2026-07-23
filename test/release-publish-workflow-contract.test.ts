import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

describe("trusted npm release workflow", () => {
	it("publishes a unique main version before creating its matching tag and GitHub Release", async () => {
		const workflow = await readFile(
			new URL("../.github/workflows/publish.yml", import.meta.url),
			"utf8",
		);

		expect(workflow).toContain("branches: [main]");
		expect(workflow).toContain("id-token: write");
		expect(workflow).toContain("environment: npm");
		expect(workflow).toContain("npm publish --provenance --access public");
		expect(workflow).toContain("scripts/reconcile-release-state.mjs");
		expect(workflow).toContain('npm view "$PACKAGE@$VERSION" gitHead');
		expect(workflow).toContain('refs/tags/v$VERSION" | cut -f1');
		expect(workflow).toContain("refs/tags/v$VERSION^{}");
		expect(workflow).toContain("steps.release-state.outputs.publish == 'true'");
		expect(workflow).toContain(
			"steps.release-state.outputs.create_tag == 'true'",
		);
		expect(workflow).toContain(
			"steps.release-state.outputs.create_release == 'true'",
		);
		expect(workflow).toContain('git tag -a "v$VERSION"');
		expect(workflow).toContain("gh release create");
		expect(
			workflow.indexOf("npm publish --provenance --access public"),
		).toBeLessThan(workflow.indexOf('git tag -a "v$VERSION"'));
	});
});

import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

const workflowUrl = new URL(
	"../.github/workflows/request-ai-review.yml",
	import.meta.url,
);

describe("AI pull-request review workflow", () => {
	it("requests the AI reviewer for eligible PR events without checking out PR code", async () => {
		const workflow = await readFile(workflowUrl, "utf8");

		expect(workflow).toContain("pull_request_target:");
		expect(workflow).toContain("opened");
		expect(workflow).toContain("reopened");
		expect(workflow).toContain("ready_for_review");
		expect(workflow).toContain("synchronize");
		expect(workflow).toContain("pull-requests: write");
		expect(workflow).toContain("sjungwon03-ai");
		expect(workflow).toContain(
			'pullRequest.user.login === "sjungwon03-ai" ? "sjungwon03" : "sjungwon03-ai"',
		);
		expect(workflow).toContain("github.rest.pulls.requestReviewers");
		expect(workflow).not.toContain("actions/checkout");
		expect(workflow).not.toContain("run:");
	});
});

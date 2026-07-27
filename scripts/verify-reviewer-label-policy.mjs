import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";

const workflowPath = resolve(
	process.cwd(),
	".github/workflows/enforce-reviewer-managed-pr-labels.yml",
);
const workflow = await readFile(workflowPath, "utf8");

const requiredSnippets = [
	"pull_request_target:",
	"opened",
	"labeled",
	"issues: write",
	"pull-requests: write",
	"github.event.sender.login != 'sjungwon03-ai'",
	"removeLabel",
	"listLabelsOnIssue",
];

for (const snippet of requiredSnippets) {
	if (!workflow.includes(snippet)) {
		throw new Error(
			`Label-policy workflow is missing required contract: ${snippet}`,
		);
	}
}

if (
	!/^\s*uses:\s+actions\/github-script@[0-9a-f]{40}\s+#\s+v7\.0\.1\s*$/mu.test(
		workflow,
	)
) {
	throw new Error(
		"Label-policy workflow must pin actions/github-script to the reviewed v7.0.1 commit.",
	);
}

if (/reopened/u.test(workflow)) {
	throw new Error(
		"Label-policy workflow must preserve reviewer labels when a pull request is reopened.",
	);
}

if (/actions\/checkout@/u.test(workflow)) {
	throw new Error(
		"Label-policy workflow must not check out or execute pull-request code.",
	);
}

console.log("Reviewer-managed PR label workflow contract verified.");

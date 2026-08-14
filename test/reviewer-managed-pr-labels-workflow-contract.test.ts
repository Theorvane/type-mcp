import { readFile } from "node:fs/promises";

import { describe, expect, it, vi } from "vitest";

const workflowUrl = new URL(
	"../.github/workflows/enforce-reviewer-managed-pr-labels.yml",
	import.meta.url,
);
const AsyncFunction = Object.getPrototypeOf(async () => undefined).constructor;

type ScriptContext = {
	action: "labeled" | "opened";
	label?: { name: string };
};

async function loadWorkflowScript() {
	const workflow = await readFile(workflowUrl, "utf8");
	const match = workflow.match(/script: \|\n([\s\S]*)$/);
	if (!match) throw new Error("Expected an embedded GitHub Script workflow.");

	return match[1].replace(/^ {12}/gm, "");
}

async function runWorkflowScript(
	scriptContext: ScriptContext,
	removeLabel: ReturnType<typeof vi.fn>,
	listLabels = vi.fn().mockResolvedValue({ data: [] }),
) {
	const script = await loadWorkflowScript();
	const core = { info: vi.fn() };
	const run = new AsyncFunction("context", "github", "core", script);

	await run(
		{
			payload: {
				...scriptContext,
				pull_request: { number: 163 },
			},
			repo: { owner: "Theorvane", repo: "type-mcp" },
		},
		{
			rest: {
				issues: { listLabelsOnIssue: listLabels, removeLabel },
			},
		},
		core,
	);

	return { core, listLabels };
}

describe("reviewer-managed label workflow", () => {
	it("keeps the trusted reviewer bypass", async () => {
		const workflow = await readFile(workflowUrl, "utf8");
		expect(workflow).toContain("github.event.sender.login != 'sjungwon03-ai'");
	});

	it("treats a stale labeled-event removal 404 as a no-op", async () => {
		const removeLabel = vi.fn().mockRejectedValue({ status: 404 });

		const { core } = await runWorkflowScript(
			{ action: "labeled", label: { name: "javascript" } },
			removeLabel,
		);

		expect(removeLabel).toHaveBeenCalledTimes(1);
		expect(core.info).toHaveBeenCalledWith(
			"Label javascript was already absent.",
		);
	});

	it("propagates a non-404 labeled-event removal failure", async () => {
		const failure = { status: 403 };
		const removeLabel = vi.fn().mockRejectedValue(failure);

		await expect(
			runWorkflowScript(
				{ action: "labeled", label: { name: "javascript" } },
				removeLabel,
			),
		).rejects.toBe(failure);
	});

	it("uses the same 404-safe removal path for labels present when opened", async () => {
		const removeLabel = vi.fn().mockRejectedValue({ status: 404 });
		const listLabels = vi
			.fn()
			.mockResolvedValue({ data: [{ name: "javascript" }] });

		const { core } = await runWorkflowScript(
			{ action: "opened" },
			removeLabel,
			listLabels,
		);

		expect(listLabels).toHaveBeenCalledTimes(1);
		expect(removeLabel).toHaveBeenCalledTimes(1);
		expect(core.info).toHaveBeenCalledWith(
			"Label javascript was already absent.",
		);
	});

	it("propagates a non-404 opened-event removal failure", async () => {
		const failure = { status: 500 };
		const removeLabel = vi.fn().mockRejectedValue(failure);
		const listLabels = vi
			.fn()
			.mockResolvedValue({ data: [{ name: "javascript" }] });

		await expect(
			runWorkflowScript({ action: "opened" }, removeLabel, listLabels),
		).rejects.toBe(failure);
	});
});

import { execFileSync } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

const temporaryDirectories: string[] = [];
const releaseIntentScript = fileURLToPath(
	new URL("../scripts/determine-release-intent.mjs", import.meta.url),
);

function git(cwd: string, ...arguments_: readonly string[]): string {
	return execFileSync("git", arguments_, { cwd, encoding: "utf8" }).trim();
}

async function createRepository(): Promise<string> {
	const directory = await mkdtemp(join(tmpdir(), "type-mcp-release-intent-"));
	temporaryDirectories.push(directory);
	git(directory, "init", "--quiet", "--initial-branch=main");
	git(directory, "config", "user.email", "test@example.com");
	git(directory, "config", "user.name", "TypeMCP test");
	await writeFile(join(directory, "package.json"), '{"version":"0.2.0"}\n');
	await writeFile(
		join(directory, "package-lock.json"),
		'{"lockfileVersion":3}\n',
	);
	await writeFile(join(directory, "README.md"), "initial\n");
	git(directory, "add", ".");
	git(directory, "commit", "-m", "initial release inputs");
	return directory;
}

function releaseIntent(cwd: string, before: string, head: string): string {
	return execFileSync(process.execPath, [releaseIntentScript, before, head], {
		cwd,
		encoding: "utf8",
	}).trim();
}

afterEach(async () => {
	await Promise.all(
		temporaryDirectories
			.splice(0)
			.map((directory) => rm(directory, { force: true, recursive: true })),
	);
});

describe("release intent", () => {
	it("skips release mutation for a documentation-only push", async () => {
		const repository = await createRepository();
		const before = git(repository, "rev-parse", "HEAD");
		await writeFile(join(repository, "README.md"), "docs-only correction\n");
		git(repository, "add", "README.md");
		git(repository, "commit", "-m", "docs correction");

		expect(
			releaseIntent(repository, before, git(repository, "rev-parse", "HEAD")),
		).toBe("release_required=false");
	});

	it("requires the strict release path when release inputs change or comparison is unavailable", async () => {
		const repository = await createRepository();
		const before = git(repository, "rev-parse", "HEAD");
		await writeFile(join(repository, "package.json"), '{"version":"0.2.1"}\n');
		git(repository, "add", "package.json");
		git(repository, "commit", "-m", "release version");
		const head = git(repository, "rev-parse", "HEAD");

		expect(releaseIntent(repository, before, head)).toBe(
			"release_required=true",
		);
		expect(releaseIntent(repository, "0".repeat(40), head)).toBe(
			"release_required=true",
		);
	});
});

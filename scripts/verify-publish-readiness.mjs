import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = process.cwd();

const packages = [
	{ directory: "packages/core", name: "@type-mcp/core" },
	{ directory: "packages/http", name: "@type-mcp/http" },
];

for (const packageContract of packages) {
	const directory = resolve(root, packageContract.directory);
	const { stdout } = await execFileAsync(
		"npm",
		["pack", "--json", "--dry-run", "--ignore-scripts"],
		{ cwd: directory },
	);
	const [tarball] = JSON.parse(stdout);

	if (tarball?.name !== packageContract.name) {
		throw new Error(`${packageContract.name}: unexpected tarball metadata`);
	}

	const files = new Set(tarball.files?.map((entry) => entry.path));
	for (const expected of [
		"package.json",
		"README.md",
		"LICENSE",
		"dist/index.js",
		"dist/index.cjs",
		"dist/index.d.ts",
	]) {
		if (!files.has(expected)) {
			throw new Error(
				`${packageContract.name}: tarball is missing ${expected}`,
			);
		}
	}

	const manifest = JSON.parse(
		await readFile(resolve(directory, "package.json"), "utf8"),
	);
	if (manifest.publishConfig?.access !== "public") {
		throw new Error(`${packageContract.name}: publish access must be public`);
	}

	if (
		Object.values(manifest.dependencies ?? {}).some(
			(version) => typeof version === "string" && version.startsWith("file:"),
		)
	) {
		throw new Error(
			`${packageContract.name}: local file dependency is not publishable`,
		);
	}

	console.log(`${packageContract.name}: publish tarball contract verified`);
}

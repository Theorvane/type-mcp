import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const { stdout } = await execFileAsync(
	"npm",
	["pack", "--json", "--dry-run", "--ignore-scripts"],
	{ cwd: root },
);
const [tarball] = JSON.parse(stdout);
const manifest = JSON.parse(await readFile("package.json", "utf8"));

if (tarball?.name !== "type-mcp" || tarball?.version !== manifest.version) {
	throw new Error("type-mcp: unexpected tarball metadata");
}

const files = new Set(tarball.files?.map((entry) => entry.path));
for (const expected of [
	"package.json",
	"README.md",
	"LICENSE",
	"dist/index.js",
	"dist/index.cjs",
	"dist/index.d.ts",
	"dist/http.js",
	"dist/http.cjs",
	"dist/http.d.ts",
	"dist/langchain.js",
	"dist/langchain.cjs",
	"dist/langchain.d.ts",
]) {
	if (!files.has(expected)) {
		throw new Error(`type-mcp: tarball is missing ${expected}`);
	}
}

if (manifest.publishConfig?.access !== "public") {
	throw new Error("type-mcp: publish access must be public");
}
if (
	Object.values(manifest.dependencies ?? {}).some(
		(version) => typeof version === "string" && version.startsWith("file:"),
	)
) {
	throw new Error("type-mcp: local file dependency is not publishable");
}

console.log("type-mcp: publish tarball contract verified");

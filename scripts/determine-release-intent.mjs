import { spawnSync } from "node:child_process";

const [before, head] = process.argv.slice(2);
const shaPattern = /^[0-9a-f]{40}$/i;
const distributionFields = [
	"name",
	"version",
	"packageManager",
	"publishConfig",
	"files",
	"main",
	"module",
	"types",
	"typings",
	"bin",
	"exports",
	"imports",
	"dependencies",
	"optionalDependencies",
	"peerDependencies",
	"peerDependenciesMeta",
	"bundledDependencies",
	"bundleDependencies",
	"engines",
	"os",
	"cpu",
];

function differs(path) {
	const comparison = spawnSync(
		"git",
		["diff", "--quiet", before, head, "--", path],
		{
			stdio: "ignore",
		},
	);
	if (comparison.status === 0) return false;
	if (comparison.status === 1) return true;
	return undefined;
}

function readManifest(ref) {
	const result = spawnSync("git", ["show", `${ref}:package.json`], {
		encoding: "utf8",
	});
	if (result.status !== 0) return undefined;
	try {
		return JSON.parse(result.stdout);
	} catch {
		return undefined;
	}
}

function changesDistributionInputs() {
	const lockfileChanged = differs("package-lock.json");
	if (lockfileChanged === undefined || lockfileChanged) return true;

	const packageChanged = differs("package.json");
	if (packageChanged === undefined) return true;
	if (!packageChanged) return false;

	const beforeManifest = readManifest(before);
	const headManifest = readManifest(head);
	if (!beforeManifest || !headManifest) return true;

	return distributionFields.some(
		(field) =>
			JSON.stringify(beforeManifest[field]) !==
			JSON.stringify(headManifest[field]),
	);
}

if (!before || !head || !shaPattern.test(before) || !shaPattern.test(head)) {
	throw new Error("Expected before and head to be 40-character commit SHAs.");
}

if (/^0{40}$/i.test(before)) {
	console.log("release_required=true");
	process.exit(0);
}

if (!changesDistributionInputs()) {
	console.error(
		"docs-only main promotion; skipping npm publication and release reconciliation",
	);
	console.log("release_required=false");
	process.exit(0);
}

console.log("release_required=true");

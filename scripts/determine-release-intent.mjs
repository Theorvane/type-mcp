import { spawnSync } from "node:child_process";

const [before, head] = process.argv.slice(2);
const shaPattern = /^[0-9a-f]{40}$/i;

if (!before || !head || !shaPattern.test(before) || !shaPattern.test(head)) {
	throw new Error("Expected before and head to be 40-character commit SHAs.");
}

if (/^0{40}$/i.test(before)) {
	console.log("release_required=true");
	process.exit(0);
}

const comparison = spawnSync(
	"git",
	["diff", "--quiet", before, head, "--", "package.json", "package-lock.json"],
	{ stdio: "ignore" },
);

if (comparison.status === 0) {
	console.error(
		"docs-only main promotion; skipping npm publication and release reconciliation",
	);
	console.log("release_required=false");
	process.exit(0);
}

if (comparison.status === 1) {
	console.log("release_required=true");
	process.exit(0);
}

throw new Error("Unable to compare release inputs for this main push.");

import { access, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();

const packages = [
	{ directory: "packages/core", exportName: "createMcpServer" },
	{ directory: "packages/http", exportName: "createMcpHandler" },
];

for (const packageContract of packages) {
	const directory = resolve(root, packageContract.directory);
	const manifestPath = resolve(directory, "package.json");
	const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
	const exportMap = manifest.exports?.["."];

	if (
		exportMap === undefined ||
		typeof exportMap !== "object" ||
		exportMap === null ||
		typeof exportMap.import !== "string" ||
		typeof exportMap.require !== "string" ||
		typeof exportMap.types !== "string"
	) {
		throw new Error(`${manifest.name}: invalid root export map`);
	}

	const esmPath = resolve(directory, exportMap.import);
	const cjsPath = resolve(directory, exportMap.require);
	const typesPath = resolve(directory, exportMap.types);
	await Promise.all([access(esmPath), access(cjsPath), access(typesPath)]);

	const esm = await import(pathToFileURL(esmPath).href);
	const require = createRequire(manifestPath);
	const cjs = require(cjsPath);

	if (typeof esm[packageContract.exportName] !== "function") {
		throw new Error(
			`${manifest.name}: missing ESM ${packageContract.exportName}`,
		);
	}

	if (typeof cjs[packageContract.exportName] !== "function") {
		throw new Error(
			`${manifest.name}: missing CJS ${packageContract.exportName}`,
		);
	}

	console.log(`${manifest.name}: ESM/CJS/types export contract verified`);
}

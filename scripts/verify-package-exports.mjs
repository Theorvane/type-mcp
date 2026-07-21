import { access, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const manifestPath = resolve(root, "package.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const exportsToVerify = [
	{ key: ".", symbol: "createMcpServer" },
	{ key: "./http", symbol: "createMcpHandler" },
];

for (const { key, symbol } of exportsToVerify) {
	const exportMap = manifest.exports?.[key];
	if (
		exportMap === undefined ||
		typeof exportMap !== "object" ||
		exportMap === null ||
		typeof exportMap.import !== "string" ||
		typeof exportMap.require !== "string" ||
		typeof exportMap.types !== "string"
	) {
		throw new Error(`${manifest.name}: invalid ${key} export map`);
	}

	const esmPath = resolve(root, exportMap.import);
	const cjsPath = resolve(root, exportMap.require);
	const typesPath = resolve(root, exportMap.types);
	await Promise.all([access(esmPath), access(cjsPath), access(typesPath)]);

	const esm = await import(pathToFileURL(esmPath).href);
	const require = createRequire(manifestPath);
	const cjs = require(cjsPath);
	if (typeof esm[symbol] !== "function" || typeof cjs[symbol] !== "function") {
		throw new Error(`${manifest.name}: missing ${key} ${symbol} export`);
	}

	console.log(
		`${manifest.name}${key === "." ? "" : key.slice(1)}: ESM/CJS/types export contract verified`,
	);
}

import { access, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const manifestPath = resolve(root, "package.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const exportsToVerify = [
	{
		key: ".",
		symbols: [
			{ name: "createMcpServer", runtimeType: "function" },
			{ name: "defaultInstanceResolver", runtimeType: "object" },
			{ name: "resolveMcpServerInstance", runtimeType: "function" },
			{ name: "readMcpServerDefinition", runtimeType: "function" },
			{ name: "TypeMcpDefinitionError", runtimeType: "function" },
		],
	},
	{
		key: "./http",
		symbols: [{ name: "createMcpHandler", runtimeType: "function" }],
	},
	{
		key: "./langchain",
		symbols: [{ name: "createLangChainTools", runtimeType: "function" }],
	},
];

for (const { key, symbols } of exportsToVerify) {
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

	const [esm, typeDeclarations] = await Promise.all([
		import(pathToFileURL(esmPath).href),
		readFile(typesPath, "utf8"),
	]);
	const require = createRequire(manifestPath);
	const cjs = require(cjsPath);

	for (const { name, runtimeType } of symbols) {
		if (typeof esm[name] !== runtimeType || typeof cjs[name] !== runtimeType) {
			throw new Error(
				`${manifest.name}: missing ${key} ${name} runtime export`,
			);
		}
		if (!typeDeclarations.includes(name)) {
			throw new Error(`${manifest.name}: missing ${key} ${name} type export`);
		}
	}

	console.log(
		`${manifest.name}${key === "." ? "" : key.slice(1)}: ESM/CJS/types export contract verified`,
	);
}

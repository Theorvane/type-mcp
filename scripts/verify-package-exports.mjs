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
	{
		key: "./testing",
		symbols: [{ name: "createMcpTestSession", runtimeType: "function" }],
	},
	{
		key: "./legacy",
		symbols: [
			{ name: "McpServer", runtimeType: "function" },
			{ name: "McpTool", runtimeType: "function" },
			{ name: "getMcpServerDefinition", runtimeType: "function" },
		],
	},
];

for (const { key, symbols } of exportsToVerify) {
	const exportMap = manifest.exports?.[key];
	if (
		exportMap === undefined ||
		typeof exportMap !== "object" ||
		exportMap === null
	) {
		throw new Error(`${manifest.name}: invalid ${key} export map`);
	}

	const importExport =
		typeof exportMap.import === "string"
			? { default: exportMap.import, types: exportMap.types }
			: exportMap.import;
	const requireExport =
		typeof exportMap.require === "string"
			? { default: exportMap.require, types: exportMap.types }
			: exportMap.require;
	if (
		typeof importExport !== "object" ||
		importExport === null ||
		typeof importExport.default !== "string" ||
		typeof importExport.types !== "string" ||
		typeof requireExport !== "object" ||
		requireExport === null ||
		typeof requireExport.default !== "string" ||
		typeof requireExport.types !== "string"
	) {
		throw new Error(`${manifest.name}: invalid ${key} export map`);
	}

	const esmPath = resolve(root, importExport.default);
	const cjsPath = resolve(root, requireExport.default);
	const typesPath = resolve(root, importExport.types);
	const cjsTypesPath = resolve(root, requireExport.types);
	await Promise.all([
		access(esmPath),
		access(cjsPath),
		access(typesPath),
		access(cjsTypesPath),
	]);

	const [esm, typeDeclarations, cjsTypeDeclarations] = await Promise.all([
		import(pathToFileURL(esmPath).href),
		readFile(typesPath, "utf8"),
		readFile(cjsTypesPath, "utf8"),
	]);
	const require = createRequire(manifestPath);
	const cjs = require(cjsPath);

	for (const { name, runtimeType } of symbols) {
		if (typeof esm[name] !== runtimeType || typeof cjs[name] !== runtimeType) {
			throw new Error(
				`${manifest.name}: missing ${key} ${name} runtime export`,
			);
		}
		if (
			!typeDeclarations.includes(name) ||
			!cjsTypeDeclarations.includes(name)
		) {
			throw new Error(`${manifest.name}: missing ${key} ${name} type export`);
		}
	}

	console.log(
		`${manifest.name}${key === "." ? "" : key.slice(1)}: ESM/CJS/types export contract verified`,
	);
}

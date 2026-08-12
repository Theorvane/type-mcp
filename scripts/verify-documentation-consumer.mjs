import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { parseNpmPackJson } from "./npm-pack-json.mjs";

const packageRoot = process.cwd();
const manifest = JSON.parse(
	execFileSync(
		"node",
		[
			"--input-type=module",
			"--eval",
			"import fs from 'node:fs'; process.stdout.write(fs.readFileSync('package.json'))",
		],
		{
			cwd: packageRoot,
			encoding: "utf8",
		},
	),
);
let consumer;
let tarballPath;

function run(command, args, cwd = packageRoot) {
	return execFileSync(command, args, {
		cwd,
		encoding: "utf8",
		stdio: ["ignore", "pipe", "pipe"],
	});
}

try {
	run("npm", ["run", "build"]);
	const packed = parseNpmPackJson(
		run("npm", ["pack", "--json", "--ignore-scripts"]),
		manifest.name,
	);
	tarballPath = resolve(packageRoot, packed.filename);
	consumer = mkdtempSync(join(tmpdir(), "type-mcp-docs-consumer-"));
	mkdirSync(join(consumer, "src"));
	writeFileSync(
		join(consumer, "package.json"),
		JSON.stringify(
			{ name: "type-mcp-docs-consumer", private: true, type: "module" },
			null,
			2,
		),
	);
	writeFileSync(
		join(consumer, "tsconfig.json"),
		JSON.stringify(
			{
				compilerOptions: {
					target: "ES2022",
					module: "NodeNext",
					moduleResolution: "NodeNext",
					lib: ["ES2022", "ESNext.Decorators", "DOM", "DOM.Iterable"],
					types: ["node"],
					strict: true,
					skipLibCheck: true,
					verbatimModuleSyntax: true,
					rootDir: "src",
					outDir: "dist",
				},
				include: ["src/**/*.ts"],
			},
			null,
			2,
		),
	);
	run(
		"npm",
		[
			"install",
			"--ignore-scripts",
			"--no-audit",
			"--no-fund",
			tarballPath,
			"zod",
			"@langchain/core",
			"@types/node",
		],
		consumer,
	);
	writeFileSync(
		join(consumer, "src/petstore-server.ts"),
		`import { z } from "zod";\nimport { McpServer, McpTool } from "@theorvane/type-mcp";\n\n@McpServer({ name: "petstore", version: "1.0.0" })\nexport class PetstoreServer {\n  @McpTool({ name: "find-product", description: "Find a Petstore product by SKU.", input: z.object({ sku: z.string().min(1) }) })\n  findProduct({ sku }: { readonly sku: string }) { return { sku, available: true }; }\n}\n`,
	);
	writeFileSync(
		join(consumer, "src/server.ts"),
		`import { createMcpServer, getMcpServerDefinition, type InstanceResolver } from "@theorvane/type-mcp";\nimport { PetstoreServer } from "./petstore-server.js";\n\nconst definition = getMcpServerDefinition(PetstoreServer);\nif (definition === undefined) throw new Error("PetstoreServer is missing its declaration.");\nconst resolver: InstanceResolver<PetstoreServer> = { resolve: () => new PetstoreServer() };\nexport const server = await createMcpServer(PetstoreServer, resolver);\n`,
	);
	writeFileSync(
		join(consumer, "src/mcp-handler.ts"),
		`import { createMcpServer } from "@theorvane/type-mcp";\nimport { createMcpHandler } from "@theorvane/type-mcp/http";\nimport { PetstoreServer } from "./petstore-server.js";\nexport const handler = createMcpHandler(() => createMcpServer(PetstoreServer, { resolve: () => new PetstoreServer() }));\n`,
	);
	writeFileSync(
		join(consumer, "src/langchain-tools.ts"),
		`import { createLangChainTools } from "@theorvane/type-mcp/langchain";\nimport { PetstoreServer } from "./petstore-server.js";\nexport const tools = await createLangChainTools(PetstoreServer, { resolver: { resolve: () => new PetstoreServer() } });\n`,
	);
	run(
		resolve(packageRoot, "node_modules/typescript/bin/tsc"),
		["--noEmit", "--project", "tsconfig.json"],
		consumer,
	);
	console.log(
		`${manifest.name}: packed clean consumer compiled documented Petstore foundation, HTTP handler, and LangChain adapter`,
	);
} finally {
	if (consumer !== undefined)
		rmSync(consumer, { force: true, recursive: true });
	if (tarballPath !== undefined) rmSync(tarballPath, { force: true });
}

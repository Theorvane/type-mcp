import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { parseNpmPackJson } from "./npm-pack-json.mjs";

const packageRoot = process.cwd();
const packageName = "@theorvane/type-mcp";
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
		packageName,
	);
	tarballPath = resolve(packageRoot, packed.filename);
	consumer = mkdtempSync(join(tmpdir(), "type-mcp-legacy-consumer-"));
	run("npm", ["init", "--yes"], consumer);
	run(
		"npm",
		[
			"install",
			"--ignore-scripts",
			"--no-audit",
			"--no-fund",
			tarballPath,
			"zod",
			"@langchain/core@1.2.3",
			"@types/node",
		],
		consumer,
	);
	writeFileSync(
		join(consumer, "tsconfig.json"),
		JSON.stringify(
			{
				compilerOptions: {
					target: "ES2022",
					module: "Node16",
					moduleResolution: "Node16",
					experimentalDecorators: true,
					strict: true,
					skipLibCheck: true,
					outDir: "dist",
				},
				include: ["server.ts"],
			},
			null,
			2,
		),
	);
	writeFileSync(
		join(consumer, "server.ts"),
		`import { z } from "zod";\nimport { createMcpHandler } from "@theorvane/type-mcp/http";\nimport { createLangChainTools } from "@theorvane/type-mcp/langchain";\nimport { getMcpServerDefinition, McpServer, McpTool } from "@theorvane/type-mcp/legacy";\n\n@McpServer({ name: "legacy-catalog", version: "1.0.0" })\nclass LegacyCatalog {\n  @McpTool({ name: "find_product", description: "Finds a product.", input: z.object({ sku: z.string() }) })\n  findProduct({ sku }: { readonly sku: string }) { return { sku }; }\n}\n\nconst definition = getMcpServerDefinition(LegacyCatalog);\nif (definition?.tools[0]?.name !== "find_product") throw new Error("Legacy MCP definition was not registered.");\nif (typeof createMcpHandler !== "function") throw new Error("CJS http export missing.");\nif (typeof createLangChainTools !== "function") throw new Error("CJS langchain export missing.");\n`,
	);
	run(
		resolve(packageRoot, "node_modules/typescript/bin/tsc"),
		["--project", "tsconfig.json"],
		consumer,
	);
	run("node", ["dist/server.js"], consumer);
	console.log(
		"Verified packed CommonJS consumer with legacy TypeScript decorators.",
	);
} finally {
	if (consumer !== undefined)
		rmSync(consumer, { force: true, recursive: true });
	if (tarballPath !== undefined) rmSync(tarballPath, { force: true });
}

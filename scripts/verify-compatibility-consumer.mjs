import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { parseNpmPackJson } from "./npm-pack-json.mjs";

const packageRoot = process.cwd();
const packageName = "@theorvane/type-mcp";
let tarballPath;
const consumers = [];

function run(command, args, cwd = packageRoot) {
	return execFileSync(command, args, {
		cwd,
		encoding: "utf8",
		stdio: ["ignore", "pipe", "pipe"],
	});
}

function createConsumer(name, packageJson, tsconfig, source) {
	const consumer = mkdtempSync(join(tmpdir(), `type-mcp-${name}-consumer-`));
	consumers.push(consumer);
	writeFileSync(join(consumer, "package.json"), JSON.stringify(packageJson, null, 2));
	writeFileSync(join(consumer, "tsconfig.json"), JSON.stringify(tsconfig, null, 2));
	writeFileSync(join(consumer, "server.ts"), source);
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
	run(resolve(packageRoot, "node_modules/typescript/bin/tsc"), ["--project", "tsconfig.json"], consumer);
	run("node", ["dist/server.js"], consumer);
}

try {
	run("npm", ["run", "build"]);
	const packed = parseNpmPackJson(
		run("npm", ["pack", "--json", "--ignore-scripts"]),
		packageName,
	);
	tarballPath = resolve(packageRoot, packed.filename);

	createConsumer(
		"esm-standard",
		{ name: "type-mcp-esm-standard-consumer", private: true, type: "module" },
		{
			compilerOptions: {
				target: "ES2022",
				module: "NodeNext",
				moduleResolution: "NodeNext",
				lib: ["ES2022", "ESNext.Decorators"],
				types: ["node"],
				strict: true,
				skipLibCheck: true,
				verbatimModuleSyntax: true,
				outDir: "dist",
			},
			include: ["server.ts"],
		},
		`import { z } from "zod";
import { createMcpServer, getMcpServerDefinition, McpServer, McpTool } from "@theorvane/type-mcp";
import { createMcpHandler } from "@theorvane/type-mcp/http";
import { createLangChainTools } from "@theorvane/type-mcp/langchain";
import { McpServer as LegacyMcpServer, McpTool as LegacyMcpTool } from "@theorvane/type-mcp/legacy";

@McpServer({ name: "standard-catalog", version: "1.0.0" })
class StandardCatalog {
  @McpTool({ name: "find_product", description: "Finds a product.", input: z.object({ sku: z.string() }) })
  findProduct({ sku }: { readonly sku: string }) { return { sku }; }
}

if (getMcpServerDefinition(StandardCatalog)?.tools[0]?.name !== "find_product") throw new Error("Standard MCP definition was not registered.");
if (typeof createMcpServer !== "function") throw new Error("ESM root export missing.");
if (typeof createMcpHandler !== "function") throw new Error("ESM http export missing.");
if (typeof createLangChainTools !== "function") throw new Error("ESM langchain export missing.");
if (typeof LegacyMcpServer !== "function" || typeof LegacyMcpTool !== "function") throw new Error("ESM legacy export missing.");
`,
	);

	createConsumer(
		"cjs-legacy",
		{ name: "type-mcp-cjs-legacy-consumer", private: true },
		{
			compilerOptions: {
				target: "ES2022",
				module: "Node16",
				moduleResolution: "Node16",
				experimentalDecorators: true,
				types: ["node"],
				strict: true,
				skipLibCheck: true,
				outDir: "dist",
			},
			include: ["server.ts"],
		},
		`import { z } from "zod";
import { createMcpServer } from "@theorvane/type-mcp";
import { createMcpHandler } from "@theorvane/type-mcp/http";
import { createLangChainTools } from "@theorvane/type-mcp/langchain";
import { getMcpServerDefinition, McpServer, McpTool } from "@theorvane/type-mcp/legacy";

@McpServer({ name: "legacy-catalog", version: "1.0.0" })
class LegacyCatalog {
  @McpTool({ name: "find_product", description: "Finds a product.", input: z.object({ sku: z.string() }) })
  findProduct({ sku }: { readonly sku: string }) { return { sku }; }
}

if (getMcpServerDefinition(LegacyCatalog)?.tools[0]?.name !== "find_product") throw new Error("Legacy MCP definition was not registered.");
if (typeof createMcpServer !== "function") throw new Error("CJS root export missing.");
if (typeof createMcpHandler !== "function") throw new Error("CJS http export missing.");
if (typeof createLangChainTools !== "function") throw new Error("CJS langchain export missing.");
`,
	);

	console.log("Verified packed ESM standard-decorator and CommonJS legacy-decorator consumers across all public entrypoints.");
} finally {
	for (const consumer of consumers) rmSync(consumer, { force: true, recursive: true });
	if (tarballPath !== undefined) rmSync(tarballPath, { force: true });
}

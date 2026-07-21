import { access } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const require = createRequire(import.meta.url);

describe("type-mcp single-package contract", () => {
	it("provides root and HTTP subpath ESM, CJS, and type exports from one package", async () => {
		const exports = {
			root: {
				esm: "dist/index.js",
				cjs: "dist/index.cjs",
				types: "dist/index.d.ts",
				symbol: "createMcpServer",
			},
			http: {
				esm: "dist/http.js",
				cjs: "dist/http.cjs",
				types: "dist/http.d.ts",
				symbol: "createMcpHandler",
			},
		} as const;

		for (const exportContract of Object.values(exports)) {
			const esmPath = resolve(root, exportContract.esm);
			const cjsPath = resolve(root, exportContract.cjs);
			const typesPath = resolve(root, exportContract.types);
			await Promise.all([access(esmPath), access(cjsPath), access(typesPath)]);

			const esm = await import(pathToFileURL(esmPath).href);
			const cjs = require(cjsPath) as Record<string, unknown>;
			expect(esm[exportContract.symbol]).toBeTypeOf("function");
			expect(cjs[exportContract.symbol]).toBeTypeOf("function");
		}
	});
});

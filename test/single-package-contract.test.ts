import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { createMcpHandler } from "../src/http.js";
import { createMcpServer } from "../src/index.js";

interface PackageManifest {
	readonly exports?: Record<string, unknown>;
	readonly name?: string;
}

describe("type-mcp single-package contract", () => {
	it("declares root and public subpath exports from one package", async () => {
		const manifest = JSON.parse(
			await readFile(new URL("../package.json", import.meta.url), "utf8"),
		) as PackageManifest;

		expect(manifest.name).toBe("@theorvane/type-mcp");
		expect(manifest.exports).toHaveProperty(".");
		expect(manifest.exports).toHaveProperty("./http");
		expect(manifest.exports).toHaveProperty("./testing");
		expect(createMcpServer).toBeTypeOf("function");
		expect(createMcpHandler).toBeTypeOf("function");
	});
});

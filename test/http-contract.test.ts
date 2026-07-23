import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import * as http from "../src/http.js";

interface PackageManifest {
	readonly name?: string;
	readonly exports?: Record<string, unknown>;
}

describe("type-mcp HTTP subpath contract", () => {
	it("exports the Fetch adapter from the type-mcp/http subpath", async () => {
		const manifest = JSON.parse(
			await readFile(new URL("../package.json", import.meta.url), "utf8"),
		) as PackageManifest;

		expect(manifest.name).toBe("@theorvane/type-mcp");
		expect(manifest.exports).toHaveProperty("./http");
		expect(http.createMcpHandler).toBeTypeOf("function");
	});
});

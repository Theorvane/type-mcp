import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

interface PackageManifest {
	readonly files?: readonly string[];
	readonly publishConfig?: {
		readonly access?: string;
	};
	readonly scripts?: Record<string, string>;
	readonly dependencies?: Record<string, string>;
}

const coreManifestUrl = new URL("../package.json", import.meta.url);
const httpManifestUrl = new URL("../../http/package.json", import.meta.url);

async function readManifest(url: URL): Promise<PackageManifest> {
	return JSON.parse(
		await readFile(fileURLToPath(url), "utf8"),
	) as PackageManifest;
}

describe("npm publish contracts", () => {
	it("declares public scoped release access and protects publishing with verification", async () => {
		const manifest = await readManifest(coreManifestUrl);

		expect(manifest.publishConfig?.access).toBe("public");
		expect(manifest.files).toEqual(["dist", "README.md", "LICENSE"]);
		expect(manifest.scripts?.prepublishOnly).toContain("verify:publish");
	});

	it("uses a release version dependency instead of a local file dependency", async () => {
		const manifest = await readManifest(httpManifestUrl);

		expect(manifest.publishConfig?.access).toBe("public");
		expect(manifest.dependencies?.["@type-mcp/core"]).toBe("0.1.0");
		expect(manifest.dependencies?.["@type-mcp/core"]).not.toMatch(/^file:/);
	});
});

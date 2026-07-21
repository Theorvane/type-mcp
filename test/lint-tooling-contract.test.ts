import { access, readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

interface RootPackageManifest {
	readonly devDependencies?: Record<string, string>;
	readonly scripts?: Record<string, string>;
}

interface BiomeConfiguration {
	readonly linter?: {
		readonly rules?: {
			readonly style?: { readonly useImportType?: string };
		};
	};
}

const rootManifestUrl = new URL("../package.json", import.meta.url);
const biomeConfigUrl = new URL("../biome.json", import.meta.url);
const eslintConfigUrl = new URL("../eslint.config.mjs", import.meta.url);

async function readJson<T>(url: URL): Promise<T> {
	return JSON.parse(await readFile(url, "utf8")) as T;
}

describe("lint tooling contract", () => {
	it("uses Biome for linting and formatting without ESLint configuration", async () => {
		const manifest = await readJson<RootPackageManifest>(rootManifestUrl);
		const biomeConfig = await readJson<BiomeConfiguration>(biomeConfigUrl);

		expect(manifest.devDependencies?.["@biomejs/biome"]).toBeDefined();
		expect(manifest.devDependencies?.eslint).toBeUndefined();
		expect(manifest.devDependencies?.["typescript-eslint"]).toBeUndefined();
		expect(manifest.scripts?.lint).toBe("biome check .");
		expect(biomeConfig.linter?.rules?.style?.useImportType).toBe("error");
		await expect(access(eslintConfigUrl)).rejects.toThrow();
	});
});

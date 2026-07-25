import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

interface PackageManifest {
	readonly dependencies?: Readonly<Record<string, string>>;
	readonly exports?: Readonly<Record<string, unknown>>;
}

describe("OpenAI provider package contract", () => {
	it("publishes an isolated OpenAI subpath without a core provider dependency", async () => {
		const manifest = JSON.parse(
			await readFile(new URL("../package.json", import.meta.url), "utf8"),
		) as PackageManifest;

		expect(manifest.exports?.["./openai"]).toEqual({
			types: "./dist/openai.d.ts",
			import: "./dist/openai.js",
			require: "./dist/openai.cjs",
		});
		expect(manifest.dependencies?.openai).toBeUndefined();
		expect(manifest.dependencies?.ai).toBeUndefined();
	});
});

import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

interface PackageManifest {
	readonly dependencies?: Readonly<Record<string, string>>;
	readonly exports?: Readonly<Record<string, unknown>>;
	readonly peerDependencies?: Readonly<Record<string, string>>;
	readonly peerDependenciesMeta?: Readonly<
		Record<string, Readonly<{ readonly optional?: boolean }>>
	>;
}

describe("LangChain adapter package contract", () => {
	it("declares a standalone adapter subpath with an optional core peer", async () => {
		const manifest = JSON.parse(
			await readFile(new URL("../package.json", import.meta.url), "utf8"),
		) as PackageManifest;

		expect(manifest.exports?.["./langchain"]).toEqual({
			types: "./dist/langchain.d.ts",
			import: "./dist/langchain.js",
			require: "./dist/langchain.cjs",
		});
		expect(manifest.peerDependencies?.["@langchain/core"]).toBe("^1.2.3");
		expect(manifest.peerDependenciesMeta?.["@langchain/core"]?.optional).toBe(
			true,
		);
		expect(manifest.dependencies?.["@langchain/core"]).toBeUndefined();
		expect(manifest.dependencies?.["@langchain/langgraph"]).toBeUndefined();
	});
});

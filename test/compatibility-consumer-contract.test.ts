import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";
import { parseNpmPackJson } from "../scripts/npm-pack-json.mjs";

interface PackageManifest {
	readonly scripts?: Readonly<Record<string, string>>;
}

describe("packed consumer compatibility contract", () => {
	it("accepts npm 11 array and npm 12 package-keyed pack JSON", () => {
		const tarball = {
			filename: "theorvane-type-mcp-0.3.1.tgz",
			name: "@theorvane/type-mcp",
		};

		expect(parseNpmPackJson(JSON.stringify([tarball]), tarball.name)).toEqual(
			tarball,
		);
		expect(
			parseNpmPackJson(
				JSON.stringify({ [tarball.name]: tarball }),
				tarball.name,
			),
		).toEqual(tarball);
	});

	it("verifies every public entrypoint from executable ESM and CommonJS consumers", async () => {
		const manifest = JSON.parse(
			await readFile(new URL("../package.json", import.meta.url), "utf8"),
		) as PackageManifest;
		const verifier = await readFile(
			new URL("../scripts/verify-compatibility-consumer.mjs", import.meta.url),
			"utf8",
		);
		const packParser = await readFile(
			new URL("../scripts/npm-pack-json.mjs", import.meta.url),
			"utf8",
		);

		expect(manifest.scripts?.["verify:consumer"]).toContain(
			"verify-compatibility-consumer.mjs",
		);
		expect(verifier).toContain('"@theorvane/type-mcp"');
		expect(verifier).toContain('"@theorvane/type-mcp/http"');
		expect(verifier).toContain('"@theorvane/type-mcp/langchain"');
		expect(verifier).toContain('"@theorvane/type-mcp/legacy"');
		expect(verifier).toContain("experimentalDecorators: true");
		expect(verifier).toContain("ESNext.Decorators");
		expect(packParser).toContain("npm 11 array or npm 12 package-keyed");
	});
});

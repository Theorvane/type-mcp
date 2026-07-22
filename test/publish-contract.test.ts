import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

interface PackageManifest {
	readonly bugs?: { readonly url?: string };
	readonly files?: readonly string[];
	readonly homepage?: string;
	readonly name?: string;
	readonly private?: boolean;
	readonly publishConfig?: { readonly access?: string };
	readonly repository?: { readonly type?: string; readonly url?: string };
	readonly scripts?: Record<string, string>;
	readonly workspaces?: unknown;
}

describe("single npm package publish contract", () => {
	it("declares type-mcp as a public unscoped package with publish verification", async () => {
		const manifest = JSON.parse(
			await readFile(new URL("../package.json", import.meta.url), "utf8"),
		) as PackageManifest;

		expect(manifest.name).toBe("type-mcp");
		expect(manifest.repository).toEqual({
			type: "git",
			url: "git+https://github.com/Theorvane/type-mcp.git",
		});
		expect(manifest.homepage).toBe("https://typemcp.theorvane.tech");
		expect(manifest.bugs?.url).toBe(
			"https://github.com/Theorvane/type-mcp/issues",
		);
		expect(manifest.private).not.toBe(true);
		expect(manifest.workspaces).toBeUndefined();
		expect(manifest.publishConfig?.access).toBe("public");
		expect(manifest.files).toEqual(["dist", "README.md", "LICENSE"]);
		expect(manifest.scripts?.prepublishOnly).toContain("verify:publish");
	});
});

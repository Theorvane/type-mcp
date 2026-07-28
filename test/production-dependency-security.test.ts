import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

interface LockfilePackage {
	readonly version?: string;
}

interface Lockfile {
	readonly packages: Record<string, LockfilePackage>;
}

interface PackageManifest {
	readonly dependencies?: Record<string, string>;
}

describe("production dependency security", () => {
	it("pins an MCP SDK graph outside the audited Hono node server range", async () => {
		const manifest = JSON.parse(
			await readFile(new URL("../package.json", import.meta.url), "utf8"),
		) as PackageManifest;
		const lockfile = JSON.parse(
			await readFile(new URL("../package-lock.json", import.meta.url), "utf8"),
		) as Lockfile;

		expect(manifest.dependencies?.["@modelcontextprotocol/sdk"]).toBe("1.30.0");
		expect(manifest.dependencies?.["@hono/node-server"]).toBe("2.0.12");
		expect(
			lockfile.packages["node_modules/@modelcontextprotocol/sdk"]?.version,
		).toBe("1.30.0");
		expect(lockfile.packages["node_modules/@hono/node-server"]?.version).toBe(
			"2.0.12",
		);
	});
});

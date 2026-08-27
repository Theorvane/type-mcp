import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

interface LockfilePackage {
	readonly integrity?: string;
	readonly version?: string;
}

interface Lockfile {
	readonly packages: Record<string, LockfilePackage>;
}

interface PackageManifest {
	readonly dependencies?: Record<string, string>;
	readonly devDependencies?: Record<string, string>;
	readonly overrides?: Record<string, string>;
}

describe("production dependency security", () => {
	it("pins patched production dependency resolutions", async () => {
		const manifest = JSON.parse(
			await readFile(new URL("../package.json", import.meta.url), "utf8"),
		) as PackageManifest;
		const lockfile = JSON.parse(
			await readFile(new URL("../package-lock.json", import.meta.url), "utf8"),
		) as Lockfile;

		expect(manifest.dependencies?.["@modelcontextprotocol/server"]).toBe(
			"2.0.0",
		);
		expect(manifest.devDependencies?.["@modelcontextprotocol/client"]).toBe(
			"2.0.0",
		);
		expect(
			manifest.dependencies?.["@modelcontextprotocol/sdk"],
		).toBeUndefined();
		expect(manifest.dependencies?.["@hono/node-server"]).toBe("2.0.12");
		expect(manifest.overrides).toMatchObject({
			esbuild: "0.28.2",
			"fast-uri": "3.1.5",
			hono: "4.12.34",
			"ip-address": "10.4.0",
		});
		expect(
			lockfile.packages["node_modules/@modelcontextprotocol/server"]?.version,
		).toBe("2.0.0");
		expect(
			lockfile.packages["node_modules/@modelcontextprotocol/client"]?.version,
		).toBe("2.0.0");
		expect(
			lockfile.packages["node_modules/@modelcontextprotocol/sdk"],
		).toBeUndefined();
		expect(lockfile.packages["node_modules/@hono/node-server"]?.version).toBe(
			"2.0.12",
		);
		expect(lockfile.packages["node_modules/fast-uri"]).toBeUndefined();
		expect(lockfile.packages["node_modules/hono"]?.version).toBe("4.12.34");
		expect(lockfile.packages["node_modules/ip-address"]).toBeUndefined();
		expect(lockfile.packages["node_modules/esbuild"]?.version).toBe("0.28.2");
		expect(lockfile.packages["node_modules/@esbuild/linux-x64"]?.version).toBe(
			"0.28.2",
		);
		expect(
			lockfile.packages["node_modules/@esbuild/linux-x64"]?.integrity,
		).toBe(
			"sha512-4xTZr1FUmSoQW4XIWmit3tzQrUTZM+N3P0XV8xROKYF50XfI7xeO90+1bZvNwxIufQ9hDQVRJH5YhgPVF8A/HQ==",
		);
	});
});

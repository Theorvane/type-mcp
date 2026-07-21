import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

interface RootPackageManifest {
  readonly devDependencies?: Record<string, string>;
  readonly scripts?: Record<string, string>;
}

const rootManifestUrl = new URL("../../../package.json", import.meta.url);

async function readRootManifest(): Promise<RootPackageManifest> {
  return JSON.parse(
    await readFile(fileURLToPath(rootManifestUrl), "utf8"),
  ) as RootPackageManifest;
}

describe("lint tooling contract", () => {
  it("uses Biome rather than ESLint through the stable lint script", async () => {
    const manifest = await readRootManifest();

    expect(manifest.devDependencies?.["@biomejs/biome"]).toBeDefined();
    expect(manifest.devDependencies?.eslint).toBeUndefined();
    expect(manifest.devDependencies?.["typescript-eslint"]).toBeUndefined();
    expect(manifest.scripts?.lint).toContain("biome");
  });
});

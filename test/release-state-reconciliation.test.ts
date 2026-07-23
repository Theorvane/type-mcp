import { describe, expect, it } from "vitest";

import { reconcileReleaseState } from "../scripts/reconcile-release-state.mjs";

const expectedSha = "a".repeat(40);
const version = "0.2.0";

describe("release-state reconciliation", () => {
	it("publishes, tags, and releases a fresh version", () => {
		expect(reconcileReleaseState({ expectedSha, version })).toEqual({
			publish: true,
			createTag: true,
			createRelease: true,
		});
	});

	it("recovers a published artifact by creating its missing tag and release", () => {
		expect(
			reconcileReleaseState({
				expectedSha,
				version,
				publishedVersion: version,
				publishedGitHead: expectedSha,
			}),
		).toEqual({ publish: false, createTag: true, createRelease: true });
	});

	it("recovers after tag creation by creating only the missing release", () => {
		expect(
			reconcileReleaseState({
				expectedSha,
				version,
				publishedVersion: version,
				publishedGitHead: expectedSha,
				tagSha: expectedSha,
			}),
		).toEqual({ publish: false, createTag: false, createRelease: true });
	});

	it("rejects a partial release that does not belong to the current main commit", () => {
		expect(() =>
			reconcileReleaseState({
				expectedSha,
				version,
				publishedVersion: version,
				publishedGitHead: "b".repeat(40),
			}),
		).toThrow(/does not match/);
	});

	it("rejects an existing lightweight tag instead of treating it as missing", () => {
		expect(() =>
			reconcileReleaseState({
				expectedSha,
				version,
				publishedVersion: version,
				publishedGitHead: expectedSha,
				tagRefSha: expectedSha,
			}),
		).toThrow(/not annotated/);
	});
});

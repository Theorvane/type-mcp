export function reconcileReleaseState(state) {
	const published = state.publishedVersion === state.version;
	const tagExists = Boolean(state.tagSha);
	const releaseExists = Boolean(state.releaseTargetSha);

	if (published && state.publishedGitHead !== state.expectedSha) {
		throw new Error("published npm artifact does not match the release commit");
	}
	if (tagExists && state.tagSha !== state.expectedSha) {
		throw new Error("existing version tag does not match the release commit");
	}
	if (releaseExists && state.releaseTargetSha !== state.expectedSha) {
		throw new Error(
			"existing GitHub Release does not match the release commit",
		);
	}
	if (!published && (tagExists || releaseExists)) {
		throw new Error("cannot recover a tag or release without its npm artifact");
	}
	if (releaseExists && !tagExists) {
		throw new Error("GitHub Release exists without its immutable version tag");
	}

	return {
		publish: !published,
		createTag: !tagExists,
		createRelease: !releaseExists,
	};
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
	const [
		expectedSha,
		version,
		publishedVersion,
		publishedGitHead,
		tagSha,
		releaseTargetSha,
	] = process.argv.slice(2);
	if (!expectedSha || !version) {
		throw new Error("expected release SHA and version are required");
	}
	console.log(
		JSON.stringify(
			reconcileReleaseState({
				expectedSha,
				version,
				...(publishedVersion ? { publishedVersion } : {}),
				...(publishedGitHead ? { publishedGitHead } : {}),
				...(tagSha ? { tagSha } : {}),
				...(releaseTargetSha ? { releaseTargetSha } : {}),
			}),
		),
	);
}

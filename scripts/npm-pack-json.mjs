function isRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function findTarball(value, packageName) {
	if (Array.isArray(value)) {
		return value.find((entry) => isRecord(entry) && entry.name === packageName);
	}

	if (!isRecord(value)) return undefined;
	const packageEntry = value[packageName];
	if (Array.isArray(packageEntry))
		return findTarball(packageEntry, packageName);
	if (isRecord(packageEntry)) return packageEntry;

	return Object.values(value).find(
		(entry) => isRecord(entry) && entry.name === packageName,
	);
}

/**
 * Reads the npm 11 array or npm 12 package-keyed `npm pack --json` formats.
 *
 * @param {string} output
 * @param {string} packageName
 */
export function parseNpmPackJson(output, packageName) {
	const tarball = findTarball(JSON.parse(output), packageName);
	if (!isRecord(tarball) || typeof tarball.filename !== "string") {
		throw new Error(`${packageName}: invalid npm pack JSON output`);
	}
	return tarball;
}

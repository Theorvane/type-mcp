import type { McpServer } from "@modelcontextprotocol/server";

export type McpComponentKind = "tool" | "resource" | "template" | "prompt";

export interface McpComponentVisibilityFilter {
	readonly keys?: readonly string[] | undefined;
	readonly names?: readonly string[] | undefined;
	readonly tags?: readonly string[] | undefined;
	readonly kinds?: readonly McpComponentKind[] | undefined;
	readonly matchAll?: boolean | undefined;
}

export interface McpEnableComponentsOptions
	extends McpComponentVisibilityFilter {
	readonly only?: boolean | undefined;
}

interface VisibilityHandle {
	readonly enabled: boolean;
	enable(): void;
	disable(): void;
}

export interface TrackedMcpComponent {
	readonly key: string;
	readonly name: string;
	readonly identifiers?: readonly string[] | undefined;
	readonly tags?: readonly string[] | undefined;
	readonly kind: McpComponentKind;
	readonly initiallyEnabled?: boolean | undefined;
}

interface VisibilityEntry {
	readonly key: string;
	readonly names: ReadonlySet<string>;
	readonly tags: ReadonlySet<string>;
	readonly kind: McpComponentKind;
	readonly handle: VisibilityHandle;
}

const visibilityEntries = new WeakMap<McpServer, readonly VisibilityEntry[]>();

export function initializeMcpVisibility(server: McpServer): void {
	visibilityEntries.set(server, []);
}

export function trackMcpComponent(
	server: McpServer,
	component: TrackedMcpComponent,
	handle: VisibilityHandle,
): void {
	const entries = visibilityEntries.get(server);
	if (entries === undefined) {
		throw new TypeError("MCP visibility registry is not initialized");
	}
	const entry = Object.freeze({
		key: component.key,
		names: new Set([component.name, ...(component.identifiers ?? [])]),
		tags: new Set(component.tags ?? []),
		kind: component.kind,
		handle,
	});
	visibilityEntries.set(server, Object.freeze([...entries, entry]));
	if (component.initiallyEnabled === false && handle.enabled) {
		handle.disable();
	}
}

export function enableMcpComponents(
	server: McpServer,
	options: McpEnableComponentsOptions,
): number {
	const entries = requireEntries(server);
	const filter = parseFilter(options);
	if (options.only !== undefined && typeof options.only !== "boolean") {
		throw new TypeError("MCP visibility only must be a boolean");
	}
	let matched = 0;
	for (const entry of entries) {
		const selected = matches(entry, filter);
		if (selected) {
			matched += 1;
		}
		const shouldEnable =
			options.only === true ? selected : selected || entry.handle.enabled;
		setEnabled(entry.handle, shouldEnable);
	}
	return matched;
}

export function disableMcpComponents(
	server: McpServer,
	filterValue: McpComponentVisibilityFilter,
): number {
	const entries = requireEntries(server);
	const filter = parseFilter(filterValue);
	let matched = 0;
	for (const entry of entries) {
		if (!matches(entry, filter)) {
			continue;
		}
		matched += 1;
		setEnabled(entry.handle, false);
	}
	return matched;
}

interface ParsedVisibilityFilter {
	readonly keys: ReadonlySet<string>;
	readonly names: ReadonlySet<string>;
	readonly tags: ReadonlySet<string>;
	readonly kinds: ReadonlySet<McpComponentKind>;
	readonly matchAll: boolean;
}

function parseFilter(
	filter: McpComponentVisibilityFilter,
): ParsedVisibilityFilter {
	if (typeof filter !== "object" || filter === null) {
		throw new TypeError("MCP visibility filter must be an object");
	}
	if (filter.matchAll !== undefined && typeof filter.matchAll !== "boolean") {
		throw new TypeError("MCP visibility matchAll must be a boolean");
	}
	const keys = readStrings(filter.keys, "keys");
	const names = readStrings(filter.names, "names");
	const tags = readStrings(filter.tags, "tags");
	const kinds = readKinds(filter.kinds);
	if (
		filter.matchAll !== true &&
		keys.size === 0 &&
		names.size === 0 &&
		tags.size === 0 &&
		kinds.size === 0
	) {
		throw new TypeError("MCP visibility filter requires criteria or matchAll");
	}
	return { keys, names, tags, kinds, matchAll: filter.matchAll === true };
}

function readStrings(
	values: readonly string[] | undefined,
	label: string,
): ReadonlySet<string> {
	if (values === undefined) {
		return new Set();
	}
	if (!Array.isArray(values)) {
		throw new TypeError(`MCP visibility ${label} must be an array`);
	}
	const result = new Set<string>();
	for (const value of values) {
		if (typeof value !== "string" || value.length === 0) {
			throw new TypeError(
				`MCP visibility ${label} must contain non-empty strings`,
			);
		}
		result.add(value);
	}
	return result;
}

function readKinds(
	values: readonly McpComponentKind[] | undefined,
): ReadonlySet<McpComponentKind> {
	const strings = readStrings(values, "kinds");
	const result = new Set<McpComponentKind>();
	for (const value of strings) {
		if (
			value !== "tool" &&
			value !== "resource" &&
			value !== "template" &&
			value !== "prompt"
		) {
			throw new TypeError("MCP visibility kinds contains an unknown kind");
		}
		result.add(value);
	}
	return result;
}

function matches(
	entry: VisibilityEntry,
	filter: ParsedVisibilityFilter,
): boolean {
	return (
		filter.matchAll ||
		filter.keys.has(entry.key) ||
		hasIntersection(filter.names, entry.names) ||
		hasIntersection(filter.tags, entry.tags) ||
		filter.kinds.has(entry.kind)
	);
}

function hasIntersection(
	left: ReadonlySet<string>,
	right: ReadonlySet<string>,
): boolean {
	for (const value of left) {
		if (right.has(value)) {
			return true;
		}
	}
	return false;
}

function setEnabled(handle: VisibilityHandle, enabled: boolean): void {
	if (handle.enabled === enabled) {
		return;
	}
	if (enabled) {
		handle.enable();
	} else {
		handle.disable();
	}
}

function requireEntries(server: McpServer): readonly VisibilityEntry[] {
	const entries = visibilityEntries.get(server);
	if (entries === undefined) {
		throw new TypeError(
			"MCP visibility controls require a TypeMCP-compiled server",
		);
	}
	return entries;
}

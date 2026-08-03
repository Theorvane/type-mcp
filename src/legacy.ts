import { storeMcpServerDefinition } from "./metadata/definitions.js";
import type {
	McpPromptDefinition,
	McpPromptOptions,
	McpResourceDefinition,
	McpResourceOptions,
	McpServerConstructor,
	McpServerOptions,
	McpToolDefinition,
	McpToolOptions,
} from "./types.js";

export { createMcpServer } from "./compiler/create-mcp-server.js";
export { TypeMcpDefinitionError } from "./errors.js";
export { getMcpServerDefinition } from "./metadata/definitions.js";
export { readMcpServerDefinition } from "./metadata/read-server-definition.js";
export { defaultInstanceResolver } from "./resolver/default-instance-resolver.js";
export type { InstanceResolver } from "./resolver/instance-resolver.js";
export { resolveMcpServerInstance } from "./resolver/resolve-server-instance.js";
export type {
	McpPromptDefinition,
	McpPromptOptions,
	McpResourceDefinition,
	McpResourceOptions,
	McpServerConstructor,
	McpServerOptions,
	McpToolDefinition,
	McpToolOptions,
} from "./types.js";

export type LegacyClassDecorator = <T extends McpServerConstructor>(
	target: T,
) => void;

export type LegacyMethodDecorator = (
	target: object,
	propertyKey: string | symbol,
	descriptor: PropertyDescriptor,
) => void;

interface PendingDefinitions {
	readonly tools: McpToolDefinition[];
	readonly resources: McpResourceDefinition[];
	readonly prompts: McpPromptDefinition[];
}

const pendingDefinitions = new WeakMap<object, PendingDefinitions>();

export function McpServer(options: McpServerOptions): LegacyClassDecorator {
	return (target): void => {
		const pending = pendingDefinitions.get(target) ?? emptyDefinitions();
		storeMcpServerDefinition(target, {
			name: options.name,
			version: options.version,
			tools: pending.tools,
			resources: pending.resources,
			prompts: pending.prompts,
		});
	};
}

export function McpTool(options: McpToolOptions): LegacyMethodDecorator {
	return (target, propertyKey, descriptor): void => {
		const methodName = requireMethodName(propertyKey, descriptor);
		const pending = getPendingDefinitions(target.constructor);
		pending.tools.push({
			name: options.name ?? methodName,
			methodName,
			description: options.description,
			input: options.input,
		});
	};
}

export function McpResource(
	options: McpResourceOptions,
): LegacyMethodDecorator {
	return (target, propertyKey, descriptor): void => {
		const methodName = requireMethodName(propertyKey, descriptor);
		const pending = getPendingDefinitions(target.constructor);
		pending.resources.push({
			name: options.name ?? methodName,
			methodName,
			uri: options.uri,
			mimeType: options.mimeType,
			description: options.description,
		});
	};
}

export function McpPrompt(options: McpPromptOptions): LegacyMethodDecorator {
	return (target, propertyKey, descriptor): void => {
		const methodName = requireMethodName(propertyKey, descriptor);
		const pending = getPendingDefinitions(target.constructor);
		pending.prompts.push({
			name: options.name ?? methodName,
			methodName,
			description: options.description,
		});
	};
}

function getPendingDefinitions(target: object): PendingDefinitions {
	const existing = pendingDefinitions.get(target);
	if (existing !== undefined) {
		return existing;
	}

	const pending = emptyDefinitions();
	pendingDefinitions.set(target, pending);
	return pending;
}

function emptyDefinitions(): PendingDefinitions {
	return { tools: [], resources: [], prompts: [] };
}

function requireMethodName(
	propertyKey: string | symbol,
	descriptor: PropertyDescriptor,
): string {
	if (typeof propertyKey !== "string") {
		throw new TypeError("MCP decorators require string-named methods");
	}
	if (typeof descriptor.value !== "function") {
		throw new TypeError("MCP decorators can decorate methods only");
	}
	return propertyKey;
}

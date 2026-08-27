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

export { completable as McpCompletable } from "@modelcontextprotocol/server";
export { createMcpServer } from "./compiler/create-mcp-server.js";
export { TypeMcpDefinitionError } from "./errors.js";
export type { McpInvocationContext } from "./invocation-context.js";
export { getMcpServerDefinition } from "./metadata/definitions.js";
export { readMcpServerDefinition } from "./metadata/read-server-definition.js";
export { defaultInstanceResolver } from "./resolver/default-instance-resolver.js";
export type { InstanceResolver } from "./resolver/instance-resolver.js";
export { resolveMcpServerInstance } from "./resolver/resolve-server-instance.js";
export type {
	McpPromptDefinition,
	McpPromptOptions,
	McpResourceCompletion,
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
			title: options.title,
			description: options.description,
			websiteUrl: options.websiteUrl,
			icons: options.icons,
			instructions: options.instructions,
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
			title: options.title,
			description: options.description,
			input: options.input,
			outputSchema: options.outputSchema,
			annotations: options.annotations,
			_meta: options._meta,
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
			title: options.title,
			uri: options.uri,
			mimeType: options.mimeType,
			description: options.description,
			icons: options.icons,
			annotations: options.annotations,
			_meta: options._meta,
			input: options.input,
			complete: options.complete,
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
			title: options.title,
			description: options.description,
			args: options.args,
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

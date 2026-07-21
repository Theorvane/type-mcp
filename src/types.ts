import type { ZodObject } from "zod";

export type McpServerConstructor = abstract new (...args: never[]) => object;

export interface McpServerOptions {
	readonly name: string;
	readonly version: string;
}

export interface McpToolOptions {
	readonly name?: string | undefined;
	readonly description?: string | undefined;
	readonly input: ZodObject;
}

export interface McpResourceOptions {
	readonly name?: string | undefined;
	readonly uri: string;
	readonly mimeType?: string | undefined;
	readonly description?: string | undefined;
}

export interface McpPromptOptions {
	readonly name?: string | undefined;
	readonly description?: string | undefined;
}

export interface McpToolDefinition extends McpToolOptions {
	readonly name: string;
	readonly methodName: string;
}

export interface McpResourceDefinition extends McpResourceOptions {
	readonly name: string;
	readonly methodName: string;
}

export interface McpPromptDefinition extends McpPromptOptions {
	readonly name: string;
	readonly methodName: string;
}

export interface McpServerDefinition extends McpServerOptions {
	readonly tools: readonly McpToolDefinition[];
	readonly resources: readonly McpResourceDefinition[];
	readonly prompts: readonly McpPromptDefinition[];
}

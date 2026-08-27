import type {
	Annotations,
	Icon,
	ToolAnnotations,
} from "@modelcontextprotocol/server";
import type { ZodObject } from "zod";

export type McpResourceCompletion = (
	value: string,
	context?: { readonly arguments?: Readonly<Record<string, string>> },
) => readonly string[] | Promise<readonly string[]>;

export type McpServerConstructor<
	T extends object = object,
	Arguments extends readonly unknown[] = readonly unknown[],
> = new (...args: Arguments) => T;

export type ZeroArgumentMcpServerConstructor<T extends object = object> =
	new () => T;

export interface McpServerOptions {
	readonly name: string;
	readonly version: string;
	readonly title?: string | undefined;
	readonly description?: string | undefined;
	readonly websiteUrl?: string | undefined;
	readonly icons?: readonly Readonly<Icon>[] | undefined;
	readonly instructions?: string | undefined;
}

export interface McpComponentVisibilityOptions {
	readonly enabled?: boolean | undefined;
	readonly tags?: readonly string[] | undefined;
}

export interface McpToolOptions extends McpComponentVisibilityOptions {
	readonly name?: string | undefined;
	readonly title?: string | undefined;
	readonly description?: string | undefined;
	readonly input: ZodObject;
	readonly outputSchema?: ZodObject | undefined;
	readonly annotations?: Readonly<ToolAnnotations> | undefined;
	readonly _meta?: Readonly<Record<string, unknown>> | undefined;
}

export interface McpResourceOptions extends McpComponentVisibilityOptions {
	readonly name?: string | undefined;
	readonly title?: string | undefined;
	readonly uri: string;
	readonly mimeType?: string | undefined;
	readonly description?: string | undefined;
	readonly icons?: readonly Readonly<Icon>[] | undefined;
	readonly annotations?: Readonly<Annotations> | undefined;
	readonly _meta?: Readonly<Record<string, unknown>> | undefined;
	readonly input?: ZodObject | undefined;
	readonly complete?:
		| Readonly<Record<string, McpResourceCompletion>>
		| undefined;
}

export interface McpPromptOptions extends McpComponentVisibilityOptions {
	readonly name?: string | undefined;
	readonly title?: string | undefined;
	readonly description?: string | undefined;
	readonly args?: ZodObject | undefined;
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

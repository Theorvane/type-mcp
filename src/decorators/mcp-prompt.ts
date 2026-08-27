import type { output, ZodObject } from "zod";
import { appendPromptDefinition } from "../metadata/metadata.js";
import type { McpPromptOptions } from "../types.js";

type PromptDecorator<Arguments extends readonly unknown[]> = <This>(
	value: (this: This, ...arguments_: Arguments) => unknown,
	context: ClassMethodDecoratorContext<
		This,
		(this: This, ...arguments_: Arguments) => unknown
	>,
) => void;

export function McpPrompt<Schema extends ZodObject>(
	options: McpPromptOptions & { readonly args: Schema },
): PromptDecorator<readonly [input: output<Schema>]>;
export function McpPrompt(
	options: McpPromptOptions & { readonly args?: undefined },
): PromptDecorator<readonly []>;
export function McpPrompt(
	options: McpPromptOptions,
): PromptDecorator<readonly []> | PromptDecorator<readonly [input: unknown]> {
	return function <This, Arguments extends readonly unknown[]>(
		_value: (this: This, ...arguments_: Arguments) => unknown,
		context: ClassMethodDecoratorContext<
			This,
			(this: This, ...arguments_: Arguments) => unknown
		>,
	): void {
		const methodName = getMethodName(context);

		appendPromptDefinition(context.metadata, {
			name: options.name ?? methodName,
			methodName,
			title: options.title,
			description: options.description,
			args: options.args,
		});
	};
}

function getMethodName(context: { readonly name: string | symbol }): string {
	if (typeof context.name !== "string") {
		throw new TypeError("MCP decorators require string-named methods");
	}

	return context.name;
}

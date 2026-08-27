import type { output, ZodObject } from "zod";
import type { McpInvocationContext } from "../invocation-context.js";
import { appendPromptDefinition } from "../metadata/metadata.js";
import type { McpPromptOptions } from "../types.js";

type PromptHandler<This, Arguments extends readonly unknown[]> =
	| ((this: This, ...arguments_: Arguments) => unknown)
	| ((
			this: This,
			...arguments_: readonly [...Arguments, context: McpInvocationContext]
	  ) => unknown);

type PromptDecorator<Arguments extends readonly unknown[]> = <
	This,
	Value extends PromptHandler<This, Arguments>,
>(
	value: Value,
	context: ClassMethodDecoratorContext<This, Value>,
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
	const decorator = function (
		_value: object,
		context: ClassMethodDecoratorContext,
	): void {
		const methodName = getMethodName(context);

		appendPromptDefinition(context.metadata, {
			name: options.name ?? methodName,
			methodName,
			title: options.title,
			description: options.description,
			args: options.args,
			enabled: options.enabled,
			tags: options.tags,
		});
	};
	return decorator as
		| PromptDecorator<readonly []>
		| PromptDecorator<readonly [input: unknown]>;
}

function getMethodName(context: { readonly name: string | symbol }): string {
	if (typeof context.name !== "string") {
		throw new TypeError("MCP decorators require string-named methods");
	}

	return context.name;
}

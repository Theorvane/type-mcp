import { z } from "zod";
import { McpPrompt, McpServer, McpTool } from "../src/index.js";

@McpServer({ name: "type-test", version: "0.1.0" })
class ValidDecoratedServer {
	@McpTool({
		input: z.object({ query: z.string() }),
	})
	search(_input: { query: string }): string {
		void _input;
		return "ok";
	}

	// @ts-expect-error McpTool can decorate methods only.
	@McpTool({ input: z.object({}) })
	readonly invalidField = "not a handler";

	@McpPrompt({})
	welcome(): string {
		return "Welcome";
	}

	// @ts-expect-error Prompt handlers with required input need an explicit args schema.
	@McpPrompt({})
	invalidPrompt(_input: { readonly sku: string }): string {
		return _input.sku;
	}

	// @ts-expect-error Prompt handler input must match the explicit args schema.
	@McpPrompt({ args: z.object({ sku: z.string() }) })
	invalidPromptInput(_input: { readonly sku: number }): string {
		return String(_input.sku);
	}

	@McpPrompt({ args: z.object({ sku: z.string() }) })
	productSummary(input: { readonly sku: string }): string {
		return input.sku;
	}
}

void ValidDecoratedServer;

import { z } from "zod";
import { McpServer, McpTool } from "../src/index.js";

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
}

void ValidDecoratedServer;

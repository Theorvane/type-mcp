import { McpServer, McpTool } from "type-mcp";
import { z } from "zod";

@McpServer({ name: "langgraph-catalog", version: "0.1.0" })
export class CatalogTools {
	@McpTool({
		name: "find-product",
		description: "Find a product by SKU.",
		input: z.object({ sku: z.string().min(1) }),
	})
	public findProduct({ sku }: { readonly sku: string }): string {
		return `Product ${sku} is available.`;
	}
}

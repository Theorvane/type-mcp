import { McpServer, McpTool } from "@theorvane/type-mcp";
import { z } from "zod";

@McpServer({ name: "catalog-example", version: "0.1.0" })
export class CatalogServer {
	@McpTool({
		name: "find-product",
		description: "Look up one catalog product by SKU.",
		input: z.object({ sku: z.string().min(1) }),
	})
	public findProduct({ sku }: { readonly sku: string }): string {
		return `Product ${sku} is available.`;
	}
}

import { ToolNode } from "@langchain/langgraph/prebuilt";
import { createLangChainTools } from "@theorvane/type-mcp/langchain";

import { CatalogTools } from "./catalog-tools.js";

export async function createCatalogToolNode(): Promise<ToolNode> {
	return new ToolNode([...(await createLangChainTools(CatalogTools))]);
}

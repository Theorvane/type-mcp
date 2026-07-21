const symbolWithMetadata = Symbol as unknown as {
	metadata?: symbol;
};

if (symbolWithMetadata.metadata === undefined) {
	Object.defineProperty(Symbol, "metadata", {
		configurable: true,
		value: Symbol("Symbol.metadata"),
	});
}

export const MCP_TOOLS_METADATA_KEY = Symbol("type-mcp:tools");
export const MCP_RESOURCES_METADATA_KEY = Symbol("type-mcp:resources");
export const MCP_PROMPTS_METADATA_KEY = Symbol("type-mcp:prompts");

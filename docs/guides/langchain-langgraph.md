# LangChain and LangGraph integration

> **Release boundary:** `type-mcp/langchain` is available in the published `type-mcp@0.2.0` package. It is tools-only; LangGraph remains a consumer-owned composition choice.

## Scope

`type-mcp/langchain` converts decorated `@McpTool` methods into LangChain `DynamicStructuredTool` instances. It is **tools only**:

- included: tool name, description, Zod input schema, explicit `InstanceResolver`, safe invocation results;
- excluded: MCP server startup, HTTP/stdio transport, resources, prompts, models, agent executors, graph topology, persistence, and authorization policy.

The core package and `type-mcp/http` remain independent of agent frameworks and graph runtimes; only the isolated `type-mcp/langchain` subpath depends on the LangChain peer.

## Dependency boundary

The adapter has an optional peer dependency on `@langchain/core`. A consumer that imports the adapter must install a compatible peer:

```bash
npm install type-mcp @langchain/core zod
```

LangGraph is a consumer choice, not an adapter dependency. Install it only when using a graph:

```bash
npm install @langchain/langgraph
```

## Convert decorated tools

```ts
import { createLangChainTools } from "type-mcp/langchain";

const tools = await createLangChainTools(CatalogTools);
const result = await tools[0].invoke({ sku: "SKU-7" });
```

The adapter reads existing TypeMCP metadata, validates it, resolves the server once, and creates one LangChain structured tool per decorated MCP tool. Zod rejects invalid input before application code runs. String handler results are returned unchanged; JSON-compatible non-strings are returned as JSON text. Missing handlers, rejected handlers, cyclic values, and `undefined` results resolve to `Tool execution failed` without exposing application errors.

For a dependency-requiring server, use the existing explicit resolver seam:

```ts
const tools = await createLangChainTools(InjectedTools, {
  resolver: { resolve: () => new InjectedTools(catalogService) },
});
```

## LangGraph composition

The consumer owns its graph and policies. Pass a mutable copy of the adapter result to LangGraph's `ToolNode`:

```ts
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { createLangChainTools } from "type-mcp/langchain";

const tools = await createLangChainTools(CatalogTools);
const toolNode = new ToolNode([...tools]);
```

TypeMCP does not create a graph, select a model, route messages, store state, approve calls, or host a service. Add `toolNode` to the consumer's `StateGraph` and own those decisions there.

## Repository example and verification

The [LangGraph ToolNode example](../../examples/langgraph-tools/README.md) is an in-memory repository-source example. It has no model, API key, network listener, persistence store, or external request.

```bash
npm ci
npm run example:langgraph-tools
npm test -- --run test/langgraph-tool-node.test.ts
```

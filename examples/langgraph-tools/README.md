# LangGraph ToolNode example

This repository-source example turns a decorated TypeMCP tool into a standard LangChain tool and passes it to LangGraph's `ToolNode`. TypeMCP supplies the tool declaration and adapter only; the application retains ownership of graph topology, models, authorization, persistence, and deployment.

> **Published example:** `@theorvane/type-mcp/langchain` is available from `@theorvane/type-mcp@0.2.0`. It creates tools only; applications own their LangGraph graph, model, state, and policy.

## Build from a checkout

From the repository root:

```bash
npm ci
npm run example:langgraph-tools
```

The example uses its own lockfile and a local `file:../..` dependency. It does not start a listener, call an LLM, require an API key, or perform an external request.

## Composition boundary

`src/catalog-tools.ts` declares a `find-product` tool. `src/server.ts` performs the only integration step:

```ts
const tools = await createLangChainTools(CatalogTools);
const toolNode = new ToolNode([...tools]);
```

`ToolNode` requires a mutable array, so the readonly adapter result is copied at the consumer boundary. Add `toolNode` to your own `StateGraph` and decide routing, confirmation, authorization, state/checkpointing, and model behavior there.

## Smoke test

```bash
npm test -- --run test/langgraph-tool-node.test.ts
```

The test builds this exact example and invokes `ToolNode` with an in-memory `AIMessage` tool call. It proves the output is a LangChain `ToolMessage`; it uses neither a network listener nor a model.

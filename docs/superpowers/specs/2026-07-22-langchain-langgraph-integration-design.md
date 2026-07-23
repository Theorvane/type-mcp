# LangChain/LangGraph integration design

**Status:** Implemented on the repository-development line
**Date:** 2026-07-22
**Issue:** #39

## Decision

TypeMCP stays framework-neutral. Its supported agent integration boundary is the tools-only `type-mcp/langchain` subpath, which converts decorated TypeMCP tools into LangChain structured tools. LangGraph integration is consumer-owned composition: applications pass those tools to `ToolNode` and retain ownership of graph topology, models, authorization, persistence, and deployment.

## Rationale

A container-specific integration would force lifecycle, discovery, and scope commitments that do not improve the core tool interoperability use case. The existing `InstanceResolver` already provides an explicit construction seam without coupling TypeMCP to a particular application runtime.

## Package boundary

- `type-mcp` root: decorators, metadata, validation, resolver, compiler, and stdio.
- `type-mcp/http`: Fetch-standard Streamable HTTP adapter.
- `type-mcp/langchain`: tools-only adapter with an optional `@langchain/core` peer dependency.
- `@langchain/langgraph`: consumer dependency; used only by the repository integration test and example, not adapter source.

The root and HTTP subpaths do not import agent-framework or graph-runtime packages.

## Public contract

```ts
import { createLangChainTools } from "type-mcp/langchain";

const tools = await createLangChainTools(CatalogServer, { resolver });
```

| Case | Required behavior |
| --- | --- |
| Decorated tool with a Zod object input | Produces one LangChain structured tool with the declared name, description, and schema. |
| Explicit resolver | Resolves the server once per `createLangChainTools()` call. |
| Invalid input | The schema rejects before application handler invocation. |
| Handler error, cyclic value, or `undefined` | Returns the fixed safe result `Tool execution failed`. |
| LangGraph composition | A consumer can pass a mutable copy of the tool list to `new ToolNode(tools)`. |

## Exclusions

TypeMCP does not create graph topology, select models, make LLM calls, manage state/checkpoints, implement authorization policy, host a deployment, or add a framework container adapter.

## Verification

- `type-mcp/langchain` has ESM, CJS, and type artifacts.
- Adapter tests cover resolver behavior, schema validation, result normalization, and safe errors.
- The LangGraph ToolNode example runs in memory without a model, API key, listener, persistence store, or network request.
- Documentation contracts require the LangChain/LangGraph boundary in public and contributor documentation.

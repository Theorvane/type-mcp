# LangChain/LangGraph integration design

**Status:** Proposed — Issue [#39](https://github.com/Theorvane/type-mcp/issues/39).
**Date:** 2026-07-22

## Decision summary

TypeMCP will retire NestJS as its planned integration direction. The package remains framework-neutral, but its first supported agent-framework integration will be a LangChain adapter exposed from the existing unscoped package as `type-mcp/langchain`.

LangGraph integration is intentionally composition rather than a second abstraction: the adapter returns standard LangChain structured tools, which a consumer passes to LangGraph's `ToolNode`. TypeMCP will not create a graph, own agent state, or select models.

## Context

The repository currently publishes one unscoped package, `type-mcp`, with root and `type-mcp/http` subpath exports. Its prior documentation described a future NestJS adapter based on `ModuleRef`, provider discovery, and request scopes. That direction would create a framework-specific DI/lifecycle commitment without serving the intended agent-orchestration use case.

The core already has the necessary neutral seams:

- decorators retain named tool metadata and Zod input schemas;
- `createMcpServer()` resolves a decorated class through an optional `InstanceResolver`;
- compiler tool handlers validate input and normalize safe MCP results.

LangChain structured tools and LangGraph `ToolNode` can use the same metadata and resolver without importing NestJS or changing MCP transport behavior.

## Alternatives considered

### A. Separate `@type-mcp/langchain` workspace package

**Rejected now.** It creates a scoped package and workspace boundary that contradict the active single-package policy. It would require a multi-package release, peer-version, and tarball strategy before proving the adapter's API.

### B. `type-mcp/langchain` adapter subpath — selected

Add a distinct source/build/export entry in the existing package. Keep `@langchain/core` optional to consumers through an explicit peer dependency and install it only for adapter use. This preserves one npm package while isolating agent-framework code from the root and HTTP subpaths.

### C. LangGraph-specific runtime wrapper

**Rejected.** A wrapper that creates graphs, nodes, messages, or persistence would duplicate LangGraph orchestration and force TypeMCP to make agent-policy decisions. Returning LangChain-compatible tools is sufficient because `ToolNode` consumes them directly.

## Public API

The proposed subpath is:

```ts
import { createLangChainTools } from "type-mcp/langchain";

const tools = await createLangChainTools(CatalogServer, { resolver });
```

```ts
export interface CreateLangChainToolsOptions {
  readonly resolver?: InstanceResolver;
}

export async function createLangChainTools(
  serverClass: McpServerClass,
  options?: CreateLangChainToolsOptions,
): Promise<readonly StructuredTool[]>;
```

Exact exported types will be refined against the installed `@langchain/core` type definitions during implementation. The public behavior contract is fixed here:

| Case | Expected behavior |
| --- | --- |
| Decorated tool with a Zod input schema | Creates one LangChain structured tool with the declared name, description, schema, and an async invocation function. |
| `InstanceResolver` supplied | Resolves the server class once per `createLangChainTools()` call; no global service locator is used. |
| Invalid input | LangChain schema validation rejects before the decorated method executes. |
| Tool method returns a string | The structured tool returns that string. |
| Tool method returns JSON-compatible data | The adapter returns deterministic JSON text rather than an MCP response envelope. |
| Tool method throws or produces non-JSON-compatible data | The tool returns a fixed safe failure message; it does not expose stack traces, raw errors, or secrets. |
| Duplicate MCP tool names or absent server definition | Construction fails through the existing definition validation path. |

The adapter supports **tools only** in its first release. It does not convert MCP resources or prompts, create an MCP server, start stdio/HTTP transports, manage LangGraph state, or make LLM calls.

## Dependency and packaging boundary

`type-mcp` root and `type-mcp/http` remain free of LangChain, LangGraph, and NestJS imports.

- `@langchain/core` is an optional peer dependency required by consumers importing `type-mcp/langchain`.
- `@langchain/langgraph` is not imported by the adapter and remains a consumer dependency; it is installed only in the repository's LangGraph integration example/test environment.
- TypeMCP's existing Zod major must remain compatible with selected LangChain and LangGraph peer ranges. As of this design, LangGraph advertises Zod `^3.25.32 || ^4.2.0`; implementation must lock compatible tested versions in the root development dependencies and document the supported peer range.

The package build gains a `langchain` entry and export-map artifact verification. A consumer who imports the adapter without the peer installed receives the normal module-resolution error rather than a silent fallback.

## LangGraph composition

A consumer owns graph topology and policies:

```ts
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
import { createLangChainTools } from "type-mcp/langchain";

const tools = await createLangChainTools(CatalogServer);
const toolNode = new ToolNode(tools);
// Consumer adds toolNode and toolsCondition to its StateGraph.
```

The repository will include an in-memory smoke test proving that the generated tools are accepted by `ToolNode` and execute a tool call. It will not need an API key, model, server listener, persistence store, or remote service.

## NestJS removal and documentation migration

Current-facing product, architecture, API, README, guide, contributor, and agent instructions will remove promises of a future NestJS adapter. The `InstanceResolver` remains because it is a framework-neutral and useful explicit construction boundary; documentation will describe it without Nest-specific examples.

Historical design records and superseded planning documents retain their original NestJS references, but are marked historical/superseded where necessary. ADR 0001 will be replaced by a new accepted ADR describing the neutral resolver and LangChain/LangGraph integration boundary, rather than rewriting history in place.

## Security and error handling

- The adapter does not execute network requests, invoke an LLM, or create a listener.
- It neither discovers providers nor accesses a framework container.
- Input schema validation happens before invoking application code.
- Handler failures map to a fixed error result with no raw exception text.
- JSON conversion failure is handled identically.
- The adapter does not assume a LangGraph graph is safe: authorization, confirmation, and graph routing stay in the consuming application.

## Verification plan

1. Contract tests prove subpath export, tool metadata projection, resolver invocation, input validation, return normalization, and safe failures.
2. A package-install test verifies the adapter artifact and peer-resolution behavior in a clean consumer.
3. An in-memory LangGraph `ToolNode` smoke test validates direct composition.
4. Existing root, HTTP, stdio, package, and publish verification remains green.
5. Documentation tests/searches ensure current-facing docs no longer present NestJS integration as planned or supported.

## Non-goals

- A NestJS package, module, `ModuleRef`, provider discovery, or request scope support.
- A LangChain agent executor, model provider, memory system, or tracing policy.
- LangGraph persistence, checkpoints, multi-agent routing, hosted deployment, or human approval graphs.
- Resource/prompt conversion and dynamic resource templates.
- Any change to existing MCP HTTP or stdio runtime contracts.

# type-mcp historical design record

**Status:** Historical design record — package layout and integration direction superseded
**Date:** 2026-07-21

> **Current direction:** Use the single unscoped `type-mcp` package, the `type-mcp/http` subpath, and the tools-only `type-mcp/langchain` adapter. LangGraph composition belongs to the consuming application. See the [documentation index](../../README.md) and [LangChain/LangGraph integration design](2026-07-22-langchain-langgraph-integration-design.md).

## Original goal

`type-mcp` provides decorator-first TypeScript declarations for MCP servers, tools, resources, and prompts. The current repository implementation compiles those declarations through the official MCP SDK, supports stdio and Fetch-standard Streamable HTTP, and keeps application construction explicit through `InstanceResolver`.

## Historical package layout

The original multi-workspace proposal is retained only as design history. The approved package surface is now one unscoped package:

```text
type-mcp
  ├─ root: decorators, metadata, resolver, compiler, stdio
  ├─ type-mcp/http: Streamable HTTP
  └─ type-mcp/langchain: structured tools
```

## Construction boundary

Decorators record immutable metadata. `createMcpServer()` reads validated definitions and acquires an instance through `InstanceResolver`. The default resolver constructs zero-argument classes; applications needing dependencies provide their own resolver. This preserves testability and runtime independence without making TypeMCP own a container, discovery mechanism, or request scope.

## Agent integration boundary

`type-mcp/langchain` turns decorated tools into LangChain `DynamicStructuredTool` instances. A consumer can supply those tools to LangGraph `ToolNode`; the consumer retains ownership of graph routing, models, policies, state, persistence, and deployment. TypeMCP does not ship a graph wrapper.

## Safety and transport boundaries

- Tool input is validated through Zod before handler invocation.
- Invalid input and handler failures return safe MCP-visible results without application stack traces.
- `type-mcp/http` delegates protocol/session semantics to the official SDK Web Standard transport.
- OAuth, legacy SSE, dynamic resource templates, external session storage, graph runtimes, model providers, and framework-specific adapters remain out of scope.

## Verification

The repository uses strict TypeScript, Vitest, tsup, Biome, package export checks, publish-readiness checks, examples, CI, and reviewed `dev` → `main` promotions.

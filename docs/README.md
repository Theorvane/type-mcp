# TypeMCP documentation

TypeMCP is a decorator-first TypeScript package for describing an MCP server and compiling that description at an explicit application boundary. The published package is [`@theorvane/type-mcp@0.2.2`](https://www.npmjs.com/package/@theorvane/type-mcp).

> **Published boundary:** TypeMCP provides declaration metadata, definition validation, MCP SDK compilation, an explicit resolver seam, a stdio helper, a Fetch Streamable HTTP adapter, and a tools-only LangChain adapter. Applications retain ownership of **hosting, authorization, persistence, models, LangGraph composition, and deployment**.

## Start with a goal

| Goal | Read this | Published surface |
| --- | --- | --- |
| **Inspect a declaration** before exposing it | [Core concepts](guides/core-concepts.md) | Root decorators and `getMcpServerDefinition()` |
| **Run over stdio** for an MCP-capable local client | [Choose a runtime boundary](guides/runtime-selection.md#connect-stdio-when-the-process-is-the-boundary) | `startStdioServer()` |
| **Serve Streamable HTTP** from a Fetch or Next.js route | [HTTP framework integration](guides/http-and-nextjs.md) | `@theorvane/type-mcp/http` |
| **Reuse tools with LangChain** or an application-owned LangGraph graph | [LangChain and LangGraph](guides/langchain-langgraph.md) | `@theorvane/type-mcp/langchain` |
| Start a strict Petstore project | [Petstore project setup](guides/petstore-project-setup.md) | ESM, Stage 3 decorators, and application client seam |
| Compile and run the first local server | [Petstore TypeMCP foundation](guides/petstore-typemcp-foundation.md) | Explicit resolver plus `startStdioServer()` |
| Follow one small end-to-end example | [Petstore walkthrough](guides/petstore-walkthrough.md) | Root compiler plus a selected boundary |
| Inspect exact decorators and resolver contracts | [Decorator API contract](api/decorator-api.md) | Semver-governed package API |

## Core library concepts

1. **Declarations** — `@McpServer`, `@McpTool`, `@McpResource`, and `@McpPrompt` describe an MCP surface next to application methods.
2. **Definitions** — `getMcpServerDefinition()` reads a frozen declaration snapshot for application inspection.
3. **Compilation** — `createMcpServer()` validates the definition, resolves one application instance, and compiles the supported surface into the official MCP SDK server.
4. **Runtime boundary** — select stdio, Fetch Streamable HTTP, or tools-only LangChain reuse only when the application needs that boundary.

Read [core concepts](guides/core-concepts.md) before selecting a transport, then use the [Petstore walkthrough](guides/petstore-walkthrough.md) to see the same declaration progress through a real choice.

## Reference and integration guides

### Start

- [Petstore project setup](guides/petstore-project-setup.md) — a new strict TypeScript workspace and application-owned client seam.
- [Petstore TypeMCP foundation](guides/petstore-typemcp-foundation.md) — inspect, compile through an explicit resolver, and run stdio locally.
- [Getting started](guides/getting-started.md) — install, configure standard decorators, declare, and inspect a server.
- [Core concepts](guides/core-concepts.md) — definitions, validation/compiler, resolver, and responsibility boundaries.
- [Petstore walkthrough](guides/petstore-walkthrough.md) — a compact catalog server from declaration to selected integration.

### Integrations

- [Choose a runtime boundary](guides/runtime-selection.md) — root, stdio, HTTP, or tools-only LangChain selection.
- [HTTP framework integration](guides/http-and-nextjs.md) — Fetch and Next.js route shape.
- [LangChain and LangGraph integration](guides/langchain-langgraph.md) — structured tools and consumer-owned graph composition.
- [Configuration and compatibility](guides/configuration.md) — Node, ESM/CommonJS, and TypeScript configuration.
- [Agent integration guide](guides/agent-integration.md) — evidence-first workflow for coding agents.

### API and architecture

- [Decorator API contract](api/decorator-api.md) — public declarations, compiler, resolver, and transport contracts.
- [Architecture overview](architecture/overview.md) — published component flow.
- [MVP scope](product/mvp-scope.md) — published, deferred, and excluded capabilities.

### Executable repository examples

- [Standalone HTTP example](../examples/standalone-http/README.md) — compile, initialize, list, and call a `find-product` tool in memory through Fetch-compatible Streamable HTTP.
- [LangGraph ToolNode example](../examples/langgraph-tools/README.md) — convert a decorated tool to a LangChain tool and pass it to an application-owned `ToolNode`.

## Documentation status convention

- **Implemented**: present in merged code and verified by tests.
- **Planned**: approved interface or behavior not yet merged.
- **Deferred**: explicitly outside the current published scope.

Planning, release, and product-history documents remain available under `docs/planning/`, `docs/product/`, and `docs/architecture/`. They are not installation or API references; check the published boundary above before treating any claim as installed behavior.

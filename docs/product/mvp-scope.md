# MVP scope

> **Published package:** `@theorvane/type-mcp@0.2.0` includes this MVP's metadata, validation, resolver, compiler, stdio, HTTP, and tools-only LangChain adapter. Start with the [README](../../README.md) and [getting-started guide](../guides/getting-started.md) for exact exports and boundaries.

**Status:** Implemented and published in `@theorvane/type-mcp@0.2.0`: decorator metadata storage, definition validation, the instance resolver seam, compiler behavior, the Node stdio helper, the Fetch Streamable HTTP adapter, and the tools-only LangChain adapter.

## Included

| Capability | MVP boundary |
| --- | --- |
| Server declaration | `@McpServer({ name, version })` on a class |
| Tools | `@McpTool()` with name/description and Zod object input schema |
| Resources | `@McpResource()` for explicit static URIs |
| Prompts | `@McpPrompt()` for named prompt handlers |
| Compilation | Decorator metadata compiled to `@modelcontextprotocol/sdk` `McpServer` |
| Instance construction | Direct constructor default plus async-capable `InstanceResolver` interface |
| Local transport | stdio helper |
| Web transport | Fetch-standard Streamable HTTP handler |
| Agent tool integration | `@theorvane/type-mcp/langchain` converts decorated tools; LangGraph `ToolNode` composition is consumer-owned |
| Developer quality | strict TS, Vitest, tsup build, CI, examples, README |

## Deferred

| Capability | Why deferred |
| --- | --- |
| OAuth/authentication | Requires explicit threat model, identity contract, and deployment guidance. |
| Redis or external session storage | SDK transport/session semantics must be proven locally first. |
| Legacy SSE transport | Streamable HTTP is the modern target transport for the MVP. |
| Dynamic resource URI templates | Static resource semantics provide a smaller, testable first surface. |
| Prompt argument inference | Explicit options avoid unstable reflection behavior. |
| Multi-server route registry | One compiled server per handler keeps the first adapter simple. |
| Additional release automation | Initial publication is complete. Future versions use the reviewed `dev` to `main` promotion and OIDC Trusted Publishing workflow. |

## Constraints

- Public distribution: `@theorvane/type-mcp@0.2.0` on npm; the repository is `Theorvane/type-mcp`.
- Runtime protocol behavior comes from the official MCP SDK.
- Core and HTTP have no agent-framework runtime or peer dependency; `@theorvane/type-mcp/langchain` has an isolated optional LangChain peer.
- Public types are strict and runtime input is validated before handler invocation.
- No user-visible error may include an unfiltered application stack trace.

## Change control

Any deferred item requires: (1) a dedicated product/architecture decision, (2) a behavior table in `docs/api/`, (3) failing tests for new safety or compatibility gates, and (4) a revised implementation plan before code begins.

# MVP scope

> **Release package:** `@theorvane/type-mcp@0.4.0` includes the MVP baseline plus SDK v2 serving, modern metadata, instructions, structured output, dynamic prompts/resources, invocation context, testing/media helpers, and component visibility.

**Status:** Included capabilities below are part of the `@theorvane/type-mcp@0.4.0` release contract.

## Included

| Capability | MVP boundary |
| --- | --- |
| Server declaration | `name`, `version`, optional standard implementation identity, and client instructions |
| Tools | `@McpTool()` with name/description and Zod object input schema |
| Resources | explicit static URIs, validated URI templates, and variable completion |
| Prompts | named zero-argument handlers, explicit validated arguments, and completion |
| Compilation | Decorator metadata compiled to the stable split `@modelcontextprotocol/server` v2 `McpServer` |
| Invocation context | request/session identity, SDK cancellation signal, and progress reporting |
| Testing | official SDK v2 in-memory client/server session with explicit cleanup |
| Media | byte-only image/audio helpers with explicit MIME validation |
| Component visibility | static enabled state and server-level key/name/tag/kind filtering |
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
| Multi-server route registry | One compiled server per handler keeps the first adapter simple. |
| Additional release automation | Initial publication is complete. Future versions use the reviewed `dev` to `main` promotion and OIDC Trusted Publishing workflow. |

## Constraints

- Public distribution: `@theorvane/type-mcp@0.4.0` on npm; the repository is `Theorvane/type-mcp`.
- Runtime protocol behavior comes from the official MCP SDK.
- Core and HTTP have no agent-framework runtime or peer dependency; `@theorvane/type-mcp/langchain` has an isolated optional LangChain peer.
- Public types are strict and runtime input is validated before handler invocation.
- No user-visible error may include an unfiltered application stack trace.

## Change control

Any deferred item requires: (1) a dedicated product/architecture decision, (2) a behavior table in `docs/api/`, (3) failing tests for new safety or compatibility gates, and (4) a revised implementation plan before code begins.

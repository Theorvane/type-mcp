# MVP scope

**Status:** Decorator metadata storage, definition validation, the instance resolver seam, and tool compilation are implemented today. Resource/prompt compilation, transport, and their runtime behavior remain planned work.

## Included

| Capability | MVP boundary |
| --- | --- |
| Server declaration | `@McpServer({ name, version })` on a class |
| Tools | `@McpTool()` with name/description and Zod object input schema |
| Resources | `@McpResource()` for explicit static URIs |
| Prompts | `@McpPrompt()` for named prompt handlers |
| Compilation | Validated `@McpTool` metadata compiled to `@modelcontextprotocol/sdk` `McpServer`; resources/prompts are a follow-up compiler task |
| Instance construction | Direct constructor default plus async-capable `InstanceResolver` interface |
| Local transport | stdio helper |
| Web transport | Fetch-standard Streamable HTTP handler |
| Developer quality | strict TS, Vitest, tsup build, CI, examples, README |

## Deferred

| Capability | Why deferred |
| --- | --- |
| NestJS integration | Requires a focused design for provider discovery and request scopes; the root resolver seam comes first. |
| OAuth/authentication | Requires explicit threat model, identity contract, and deployment guidance. |
| Redis or external session storage | SDK transport/session semantics must be proven locally first. |
| Legacy SSE transport | Streamable HTTP is the modern target transport for the MVP. |
| Dynamic resource URI templates | Static resource semantics provide a smaller, testable first surface. |
| Prompt argument inference | Explicit options avoid unstable reflection behavior. |
| Multi-server route registry | One compiled server per handler keeps the first adapter simple. |
| npm publishing/release automation | Private GitHub repository is the delivery target; package publication follows a separate release plan. |

## Constraints

- Repository target: private `sjungwon03/type-mcp`.
- Runtime protocol behavior comes from the official MCP SDK.
- The root `type-mcp` package must have no NestJS runtime or peer dependency.
- Public types are strict and runtime input is validated before handler invocation.
- No user-visible error may include an unfiltered application stack trace.

## Change control

Any deferred item requires: (1) a dedicated product/architecture decision, (2) a behavior table in `docs/api/`, (3) failing tests for new safety or compatibility gates, and (4) a revised implementation plan before code begins.

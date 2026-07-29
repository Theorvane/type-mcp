# type-mcp documentation

This directory is the canonical project documentation set. For an installed package, read the release note in the README and then use the guides first; product and architecture documents distinguish published runtime behavior from repository decisions and future product work.

1. [Getting started](guides/getting-started.md) — install, declare, inspect, and compile with `@theorvane/type-mcp@0.2.2`.
2. [Choose a runtime boundary](guides/runtime-selection.md) — select the released root, stdio, HTTP, or tools-only LangChain surface.
3. [Configuration and compatibility](guides/configuration.md) — Node, ESM/CommonJS, TypeScript decorators, and version boundaries.
4. [Agent integration guide](guides/agent-integration.md) — evidence-first coding-agent workflow and runtime limits.
5. [Decorator API contract](api/decorator-api.md) — published decorator declarations, runtime compilation, and transport contract.
6. [Product vision](product/vision.md) — problem, users, and success criteria.
7. [MVP scope](product/mvp-scope.md) — published MVP boundary, deferred extensions, and exclusions.
8. [Architecture overview](architecture/overview.md) — components and runtime flow.
9. [npm release readiness](guides/npm-release.md) — package ownership and pre-publish safeguards.
10. [Single-package migration plan](planning/2026-07-21-single-package-migration.md) — active packaging plan.
11. [HTTP framework integration](guides/http-and-nextjs.md) — repository-source Fetch/Next.js route integration boundary.
12. [Standalone HTTP example](../examples/standalone-http/README.md) — executable repository example and smoke test.
13. [LangChain and LangGraph integration](guides/langchain-langgraph.md) — tools-only adapter and consumer-owned ToolNode composition.
14. [LangGraph ToolNode example](../examples/langgraph-tools/README.md) — executable in-memory repository example.
15. [Open-source launch checklist](guides/open-source-launch.md) — community health, security, and public-repository safeguards.
16. [Historical MVP implementation plan](planning/2026-07-21-mvp-implementation-plan.md) — superseded two-workspace task history.

## Sections

| Directory | Canonical content |
| --- | --- |
| `product/` | Product intent, users, success metrics, and scope |
| `architecture/` | Package boundaries, runtime design, architecture decision records |
| `api/` | Public API contracts and A/E/X behavior tables |
| `guides/` | Integration walkthroughs once implementation exists |
| `planning/` | Approved, executable development plans |
| `superpowers/specs/` | Design history and approved design source |

## Documentation status convention

- **Implemented**: present in merged code and verified by tests.
- **Planned**: approved interface or behavior not yet merged.
- **Deferred**: explicitly out of the current MVP.

Every document must use these labels accurately; planned behavior must never be described as currently usable.

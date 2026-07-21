# type-mcp documentation

This directory is the canonical project documentation set. Read documents in this order when joining the project:

1. [Product vision](product/vision.md) — problem, users, and success criteria
2. [MVP scope](product/mvp-scope.md) — delivery boundary and exclusions
3. [Architecture overview](architecture/overview.md) — components and runtime flow
4. [Decorator API contract](api/decorator-api.md) — public behavior, including Accept/Error/Excluded cases
5. [npm release readiness](guides/npm-release.md) — scope ownership and pre-publish safeguards
6. [MVP implementation plan](planning/2026-07-21-mvp-implementation-plan.md) — task-level execution order

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

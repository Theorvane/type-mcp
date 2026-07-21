# Single-package migration plan

**Status:** Approved by Issue #14. This plan replaces the two-workspace package layout in `2026-07-21-mvp-implementation-plan.md`.

## Goal

Ship one public, unscoped npm package named `type-mcp`. The decorators and metadata API are imported from `type-mcp`; the planned Fetch adapter remains available at `type-mcp/http` as a subpath export.

## Steps

1. Add a failing contract test for root and `./http` ESM/CJS/type artifacts.
2. Move the core source, tests, and type tests into root `src/`, `test/`, and `type-tests/`; move the HTTP placeholder to `src/http.ts`.
3. Make the root manifest publishable (`name: "type-mcp"`, public access, root and `./http` export map) and remove workspace manifests.
4. Configure one root tsup build, TypeScript projects, Vitest test discovery, package export verification, and tarball verification.
5. Update canonical product, architecture, API, release, README, and contributor documentation. Preserve old design specifications as historical records rather than current implementation contracts.
6. Verify focused contract test, full lint/typecheck/test/build/package/tarball gates, diff, and a clean install before review.

## Acceptance criteria

- `npm pack --dry-run` contains root and HTTP subpath ESM/CJS/type artifacts in one `type-mcp` tarball.
- Neither `packages/core` nor `packages/http` remains as a workspace/package boundary.
- No current-facing doc tells users to install or import `@type-mcp/core` or `@type-mcp/http`.
- Metadata-only implementation status remains explicit.

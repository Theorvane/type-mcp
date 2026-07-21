# Task brief — single type-mcp package

**Owner:** Hermes Agent

**Date:** 2026-07-21

**Status:** review

**Related plan:** `docs/planning/2026-07-21-single-package-migration.md`

## Objective

Replace the two unpublished `@type-mcp/*` workspaces with one publishable unscoped `type-mcp` package and a `type-mcp/http` subpath export.

## Scope

**In:** root source/build/test/package configuration, root and HTTP artifact contracts, npm tarball verification, CI, and current-facing documentation.

**Out:** npm publication, backward-compatibility shims for unpublished packages, compiler/resolver/stdio/HTTP runtime implementation.

## Acceptance criteria

- [x] Root and HTTP subpath ESM/CJS/type exports are built from one manifest.
- [x] `packages/core` and `packages/http` manifests are removed.
- [x] Clean-install, lint, typecheck, test, build, package, tarball, and consumer import verification pass.

## Files

- Move: `packages/core/src/` → `src/`; `packages/http/src/index.ts` → `src/http.ts`
- Create: root TypeScript/tsup configurations and single-package contract test
- Modify: root manifest, verification scripts, CI, and current documentation

## Red → green evidence

| Stage | Command | Result |
| --- | --- | --- |
| Red | `npm test -- --run test/single-package-contract.test.ts` | Failed: root package had no `dist/index.d.ts` artifact. |
| Green | `npm run build && npm test -- --run test/single-package-contract.test.ts` | Passed: 1 test. |
| Regression | full repository quality gate | Passed: lint, typecheck, 9 tests, build, export/tarball checks, and production audit. |

## Risks and boundaries

- No `@type-mcp/*` package has been published, so no compatibility package is needed.
- Root and HTTP APIs remain placeholders; docs explicitly retain metadata-only status.

## Review handoff

- Spec review: pending
- Quality review: pending
- Final checks: `npm ci`, lint, typecheck, test, build, package/tarball verification, consumer import test, `git diff --check`

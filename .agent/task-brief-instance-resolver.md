# Task brief — async instance resolver seam

**Owner:** Hermes Agent

**Date:** 2026-07-21

**Status:** review

**Related plan:** `docs/planning/2026-07-21-mvp-implementation-plan.md#task-6` (behavioral task; package paths superseded by the single-package migration)

## Objective

Provide the framework-neutral, async-capable construction seam needed by the future MCP compiler and a future NestJS adapter.

## Scope

**In:** exported resolver interface, zero-argument default resolver, and a helper that awaits custom resolvers.

**Out:** SDK compiler wiring, NestJS imports/integration, request scoping, transport code, and handler invocation.

## Acceptance criteria

- [x] Default resolver creates a zero-argument server instance.
- [x] Synchronous and asynchronous custom resolvers are awaited.
- [x] Custom resolver receives the exact supplied constructor.
- [x] No NestJS dependency/import is introduced.

## Files

- Create: `src/resolver/instance-resolver.ts`, `src/resolver/default-instance-resolver.ts`, `src/resolver/resolve-server-instance.ts`, `test/instance-resolver.test.ts`
- Modify: `src/types.ts`, `src/index.ts`, API/product/architecture documentation

## Red → green evidence

| Stage | Command | Result |
| --- | --- | --- |
| Red | `npm test -- --run test/instance-resolver.test.ts` | 3 failures because resolver exports did not exist. |
| Green | `npm test -- --run test/instance-resolver.test.ts` | 3 tests passed after the minimal resolver implementation. |
| Regression | full quality gate | 7 files / 17 tests, typecheck, lint, build, export/tarball checks, and audit passed. |

## Risks and boundaries

- Direct construction only supports zero-argument server classes; dependency injection belongs in a supplied resolver.
- The compiler has not yet consumed this seam.

## Review handoff

- Spec review: pending
- Quality review: pending
- Final checks: `npm ci`, lint, typecheck, test, build, package/tarball verification, production audit, `git diff --check`

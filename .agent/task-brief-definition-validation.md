# Task brief — decorated server definition validation

**Owner:** Hermes Agent

**Date:** 2026-07-21

**Status:** review

**Related plan:** `docs/planning/2026-07-21-mvp-implementation-plan.md#task-5` (behavioral task; package paths superseded by the single-package migration)

## Objective

Expose a safe public reader that rejects undecorated classes and duplicate public names before later server compilation.

## Scope

**In:** immutable definition reads, a public typed validation error, and duplicate checks per MCP namespace.

**Out:** SDK compilation, instance resolution, invocation, transports, runtime Zod parsing, and cross-namespace conflict rejection.

## Acceptance criteria

- [x] An undecorated class produces `TypeMcpDefinitionError` naming the class.
- [x] Duplicate tool/resource/prompt names each produce a safe error naming the conflict.
- [x] Equal names across tool/resource/prompt namespaces remain valid.
- [x] Returned definitions keep the existing frozen-copy boundary.

## Files

- Create: `src/errors.ts`, `src/metadata/read-server-definition.ts`, `test/definition-reader.test.ts`
- Modify: `src/index.ts`, `docs/api/decorator-api.md`, `docs/product/mvp-scope.md`

## Red → green evidence

| Stage | Command | Result |
| --- | --- | --- |
| Red | `npm test -- --run test/definition-reader.test.ts` | 3 failures because reader/error exports did not exist. |
| Green | `npm test -- --run test/definition-reader.test.ts` | 5 tests passed after implementation and namespace coverage. |
| Regression | full quality gate | 6 files / 14 tests, typecheck, lint, build, export/tarball checks, and audit passed. |

## Risks and boundaries

- Error messages contain only decorated class and public declaration names; no application exception or stack content is exposed.
- Component namespaces are intentionally distinct under MCP.

## Review handoff

- Spec review: pending
- Quality review: pending
- Final checks: `npm ci`, lint, typecheck, test, build, package/tarball verification, production audit, `git diff --check`

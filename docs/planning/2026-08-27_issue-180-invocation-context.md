# Task brief — invocation context

**Owner:** Codex

**Date:** 2026-08-27

**Status:** complete

**Related plan:** GitHub issue `#180`

**Stacked base:** PR `#179` / `feat/178-prompt-resource-templates` until merged to `dev`

## Objective

Decorated handlers can observe SDK-backed request identity and cancellation and report MCP progress through a narrow framework-neutral context.

## Scope

**In:** requestId, optional sessionId, AbortSignal, progress token handling, reportProgress, all three component kinds, safe compatibility and docs.

**Out:** logging, sampling, elicitation, roots, auth, state, raw SDK send/notify, background tasks, providers, OAuth, OpenAPI, and MCP Apps.

## Acceptance criteria

- [x] Every handler kind receives the context as its final argument.
- [x] Cancellation uses the SDK's original signal.
- [x] Progress notifications require and preserve the request progress token.
- [x] Existing handlers and safe error behavior remain compatible.
- [x] Full package verification passes.

## Red → green evidence

| Stage | Command | Result / expected reason |
| --- | --- | --- |
| Red | `npx vitest run test/invocation-context.test.ts` | Failed as expected: the missing context caused the handler to return the safe `Tool execution failed` result. |
| Green | `npx vitest run test/invocation-context.test.ts` | Passed: 3 tests cover progress/no-token behavior, every handler kind, and cancellation. |
| Regression | `npm test` | Passed: 31 files and 87 tests; lint, typecheck, build, package/publish consumer verification, production audit, and diff checks also passed. |

## Review handoff

- Spec review: pending
- Quality review: pending
- Final checks: all required local checks passed

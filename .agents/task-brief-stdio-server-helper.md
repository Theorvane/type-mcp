# Task brief — stdio server helper

**Owner:** Hermes Agent

**Date:** 2026-07-21

**Status:** review

**Related issue:** [#31](https://github.com/Theorvane/type-mcp/issues/31)

**Related plan:** `docs/planning/2026-07-21-mvp-implementation-plan.md#task-9`

## Objective

Connect an MCP SDK server to the official Node stdio transport through a small, testable root-package helper.

## Scope

**In:**
- `startStdioServer()` root export.
- Official `StdioServerTransport` default construction.
- Injected transport factory for deterministic tests.
- Exactly-one connection behavior.

**Out:**
- HTTP, session management, custom framing, process shutdown policy, application-framework adapters, and publishing.

## Acceptance criteria

- [x] Injected factory is called once and the returned transport is connected once.
- [x] Default helper uses official `StdioServerTransport`.
- [x] Focused test was observed failing before implementation.
- [x] Public docs describe Node-only stdio behavior.

## Files

- Create: `src/transports/stdio.ts`, `test/stdio.test.ts`
- Modify: `src/index.ts`, public docs
- Create: this task brief

## Red → green evidence

| Stage | Command | Result / expected reason |
| --- | --- | --- |
| Red | `npm test -- test/stdio.test.ts` | `startStdioServer is not a function` before the helper export/implementation. |
| Green | `npm test -- test/stdio.test.ts` | 2 tests pass: injected factory exactly once and official default transport. |
| Regression | `npm test` | 10 files / 26 tests pass. |

## Risks and boundaries

- Delegate framing and lifecycle to the official SDK transport.
- The root package remains independent of application frameworks and graph runtimes.
- Test injection must not write to the process standard streams.

## Review handoff

- Spec review: pending
- Quality review: pending
- Final checks: lint, typecheck, tests, build, package/publish verification, production audit, diff check

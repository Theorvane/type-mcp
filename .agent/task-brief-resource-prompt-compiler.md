# Task brief — resource and prompt compiler

**Owner:** Hermes Agent

**Date:** 2026-07-21

**Status:** review

**Related issue:** [#29](https://github.com/Theorvane/type-mcp/issues/29)

**Related plan:** `docs/planning/2026-07-21-mvp-implementation-plan.md#task-8`

## Objective

Compile decorated static resources and named prompts into the official MCP SDK server with real in-memory protocol coverage.

## Scope

**In:**
- Static resource registration and `resources/read` invocation.
- Prompt registration and `prompts/get` invocation.
- Sync/async handlers, SDK-valid result normalization, and safe handler errors.

**Out:**
- URI templates, subscriptions, prompt parameter inference, stdio, HTTP, NestJS, authorization, retries, and publishing.

## Acceptance criteria

- [x] Static resources list and read through an SDK client.
- [x] Prompts list and get through an SDK client, including an async handler.
- [x] Focused test was observed failing before production implementation.
- [x] Resource/prompt handler failures return generic content and do not expose thrown secrets.

## Files

- Create: `test/resource-prompt-compilation.test.ts`
- Modify: `src/compiler/create-mcp-server.ts`, result normalization helpers, public docs
- Create: this task brief

## Red → green evidence

| Stage | Command | Result / expected reason |
| --- | --- | --- |
| Red | `npm test -- test/resource-prompt-compilation.test.ts` | `resources/list` and `prompts/list` returned MCP `-32601 Method not found` before registration. |
| Green | `npm test -- test/resource-prompt-compilation.test.ts` | 3 tests pass: static resource list/read, sync/async prompts, and safe handler failure content. |
| Regression | `npm test` | 9 files / 23 tests pass. |

## Risks and boundaries

- Use only official MCP SDK registration/result contracts.
- Do not add dynamic URI-template semantics or NestJS coupling.
- Never expose handler error text or application stacks to clients.

## Review handoff

- Spec review: pending
- Quality review: pending
- Final checks: lint, typecheck, tests, build, package/publish verification, production audit, diff check

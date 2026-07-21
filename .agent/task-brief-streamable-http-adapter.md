# Task brief — Fetch Streamable HTTP adapter

**Owner:** Hermes Agent

**Date:** 2026-07-21

**Status:** review

**Related issue:** [#33](https://github.com/Theorvane/type-mcp/issues/33)

**Related plan:** `docs/planning/2026-07-21-mvp-implementation-plan.md#task-10`

## Objective

Expose a framework-neutral Fetch handler from `type-mcp/http`, delegating Streamable HTTP protocol and session semantics to the official MCP SDK Web Standard transport.

## Scope

**In:**
- `createMcpHandler()` Fetch handler factory.
- One compiled SDK server and one `WebStandardStreamableHTTPServerTransport` per factory call.
- SDK-managed stateful Streamable HTTP request handling using the official session ID response header.
- Fetch-level initialize, tools list/call, and unsupported-method tests.

**Out:**
- OAuth, durable/custom sessions, Express/Node adapters, legacy SSE, handcrafted JSON-RPC framing, NestJS, URI templates, and publishing.

## Acceptance criteria

- [x] A client-facing Fetch request initializes and invokes a decorated tool through the handler.
- [x] SDK transport handles unsupported methods.
- [x] Tests were observed failing before implementation.
- [x] Public docs distinguish implemented HTTP behavior from excluded work.

## Files

- Modify: `src/http.ts`, HTTP docs/status pages
- Create: `test/streamable-http.test.ts`
- Create: this task brief

## Red → green evidence

| Stage | Command | Result / expected reason |
| --- | --- | --- |
| Red | `npm test -- test/streamable-http.test.ts` | `createMcpHandler is not implemented yet` before implementation. |
| Green | `npm test -- test/streamable-http.test.ts` | 2 tests pass: initialize → SDK session → tools/list → tools/call, plus unsupported method delegation. |
| Regression | `npm test` | 11 files / 28 tests pass. |

## Risks and boundaries

- Use the SDK `WebStandardStreamableHTTPServerTransport`; do not duplicate protocol or session rules.
- The root package remains free of HTTP server framework dependencies.
- Stateful mode is explicit: one compiled server and one SDK transport are retained by the returned handler, and session lifecycle remains SDK-managed.

## Review handoff

- Spec review: completed — three review findings remediated (async Fetch example, negotiated protocol test, stateful lifecycle wording).
- Quality review: completed — no implementation-level blocker found after remediation.
- Final checks: lint, typecheck, tests, build, package/publish verification, production audit, diff check

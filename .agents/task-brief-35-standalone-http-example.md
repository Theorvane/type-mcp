# Task brief — standalone HTTP example

**Owner:** Hermes Agent
**Date:** 2026-07-21
**Status:** complete
**Related issue:** [#35](https://github.com/Theorvane/type-mcp/issues/35)
**Related plan:** `docs/planning/2026-07-21-mvp-implementation-plan.md#task-11`

## Objective

Provide a small runnable TypeScript example that exposes one decorated `type-mcp` tool through the `type-mcp/http` Fetch handler, and prove the documented request path without opening a network listener.

## Scope

**In:**
- `examples/standalone-http/` TypeScript source, its narrow compilation configuration, and a README with repository-source commands.
- A Vitest smoke test that initializes the example and lists/calls its tool through the Fetch handler.
- README and docs navigation links for the example.

**Out:**
- Next.js or other application-framework scaffolding, network/listening-server setup, OAuth, persistence, custom session stores, legacy SSE, and npm publication.

## Acceptance criteria

- [ ] The example uses `type-mcp` and `type-mcp/http` public identifiers in its source.
- [ ] A smoke test verifies initialize, `tools/list`, and `tools/call` through the example handler.
- [ ] Documentation explains that repository usage requires a build and does not claim current npm `0.1.0` contains the runtime APIs.
- [ ] The example compiles with the repository TypeScript toolchain.

## Files

- Create: `examples/standalone-http/package.json`
- Create: `examples/standalone-http/tsconfig.json`
- Create: `examples/standalone-http/src/catalog-server.ts`
- Create: `examples/standalone-http/src/server.ts`
- Create: `examples/standalone-http/README.md`
- Test: `test/standalone-http-example.test.ts`
- Docs: `README.md`, `docs/README.md`, `docs/guides/http-and-nextjs.md`

## Red → green evidence

| Stage | Command | Result / expected reason |
| --- | --- | --- |
| Red | `npm test -- --run test/standalone-http-example.test.ts` | Failed as expected: example module did not exist. |
| Green | `npm test -- --run test/standalone-http-example.test.ts` | Passed: initializes, lists, and calls `find-product` through the compiled Fetch handler. |
| Regression | `npm run lint && npm run typecheck && npm test && npm run build && npm run verify:package && npm run verify:publish && npm run example:standalone-http` | Passed: 31 tests; package/publish contracts and example compile passed. |

## Risks and boundaries

- The example must retain the package public import names, while source-tree verification may use the built self-reference export.
- It exercises the SDK-managed Streamable HTTP handler in memory; it must not implement protocol framing or launch a listener.

## Review handoff

- Spec review: pending
- Quality review: pending
- Final checks: repository verification commands plus example TypeScript compilation and `git diff --check`

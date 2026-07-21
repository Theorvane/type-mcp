# Task brief — tool compiler

**Owner:** Hermes Agent

**Date:** 2026-07-21

**Status:** review

**Related plan:** `docs/planning/2026-07-21-mvp-implementation-plan.md#task-4`

## Objective

Compile validated `@McpTool` declarations to an official MCP SDK `McpServer`, while preserving the framework-neutral resolver contract and safe error boundary.

## Scope

**In:**
- Tool-only registration through `createMcpServer()`.
- Official SDK integration using a real in-memory client/server transport test.
- Zod validation, asynchronous handlers, custom resolver construction, result normalization, and safe tool errors.

**Out:**
- Resource and prompt compilation.
- stdio, Streamable HTTP, NestJS integration, publishing, and package version changes.

## Acceptance criteria

- [x] Validated decorated tools appear in `tools/list` and execute through `tools/call`.
- [x] Invalid inputs do not invoke the handler and return a safe MCP tool error.
- [x] Thrown handler errors do not expose their original message or stack.
- [x] Custom resolvers support a class requiring constructor dependencies.
- [x] JSON-compatible return values normalize as text without being mistaken for an MCP result.
- [x] Type-level API rejects dependency-requiring `createMcpServer()` calls without a resolver.

## Files

- Create: `src/compiler/create-mcp-server.ts`
- Create: `src/compiler/normalize-tool-result.ts`
- Create: `test/tool-compilation.test.ts`
- Modify: `src/index.ts`, metadata constructor typing, export verifier, public docs

## Red → green evidence

| Stage | Command | Result / expected reason |
| --- | --- | --- |
| Red | `npm test -- --run test/tool-compilation.test.ts` | `createMcpServer is not implemented yet` from the previous placeholder. |
| Red | `npm test -- --run test/tool-compilation.test.ts` | JSON-return test produced empty MCP content because a generic object was accepted as a stripped SDK result. |
| Red | `npm test -- --run test/tool-compilation.test.ts` | A `{ structuredContent: … }` SDK-valid result was incorrectly normalized to JSON text. |
| Green | `npm test -- --run test/tool-compilation.test.ts` | Tool list/call, handler-skip on invalid input, async handler, safe handler error, custom resolver, JSON normalization, and structured MCP result pass-through pass. |
| Regression | `npm test` | Pending final full suite. |

## Risks and boundaries

- The core imports only the official SDK and its own resolver/metadata contracts; it has no NestJS or transport implementation.
- The compiler returns generic safe errors and never serializes application exception text.
- Only an object with an array `content` is considered a candidate raw MCP tool result; other JSON-compatible objects are normalized to text.

## Review handoff

- Spec review: pending
- Quality review: pending
- Final checks: `npm ci`, lint, typecheck, tests, build, package/publish verification, production audit, diff check

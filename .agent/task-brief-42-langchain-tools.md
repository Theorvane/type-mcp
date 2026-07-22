# Task brief — LangChain tools adapter

**Owner:** Hermes Agent
**Date:** 2026-07-22
**Status:** in-progress
**Related issue:** [#42](https://github.com/Theorvane/type-mcp/issues/42)
**Related plan:** `docs/planning/2026-07-22-langchain-langgraph-implementation-plan.md`

## Objective

Add a distributable, tools-only `type-mcp/langchain` adapter and prove its direct LangGraph ToolNode interoperability without coupling the core runtime to LangChain, LangGraph, or NestJS.

## Scope

**In:**
- `type-mcp/langchain` package/export, peer boundary, tool conversion, safe failures, resolver support, ToolNode smoke test, current-facing documentation migration, and packed-consumer verification.

**Out:**
- NestJS, resources/prompts conversion, models, graph topology/state/persistence, listeners, and authorization policies.

## Acceptance criteria

- [ ] `type-mcp/langchain` has ESM/CJS/type artifacts and an optional `@langchain/core` peer dependency.
- [ ] Decorated MCP tools become LangChain structured tools with resolver support and fixed safe failures.
- [ ] Generated tools execute through LangGraph `ToolNode` in memory.
- [ ] Current-facing docs retire the NestJS adapter direction.
- [ ] Full package, publish, test, typecheck, lint, audit, and diff checks pass.

## Files

- Create: `src/langchain.ts`, `src/langchain/create-langchain-tools.ts`, LangChain/LangGraph tests and guide/example files.
- Modify: `package.json`, `package-lock.json`, `tsup.config.ts`, package verifiers, current-facing docs.
- Test: `test/langchain-*.test.ts`.

## Red → green evidence

| Stage | Command | Result / expected reason |
| --- | --- | --- |
| Red | `npm test -- --run test/langchain-package-contract.test.ts` | Failed as expected: `./langchain` export was absent. |
| Green | `npm test -- --run test/langchain-package-contract.test.ts` | Passed: 1 test. |
| Regression | `npm run typecheck && npm run build` | Passed; tsup emitted `dist/langchain` ESM/CJS/type artifacts. |

## Risks and boundaries

- Adapter source may import only `@langchain/core`; root, HTTP, and existing MCP compiler source remain free of LangChain, LangGraph, and NestJS imports.
- A LangGraph test must use no model, listener, API key, or network call.
- Error results cannot disclose application data.

## Review handoff

- Spec review: pending.
- Quality review: pending.
- Final checks: `npm ci`, lint, typecheck, test, build, package/publish verification, production audit, `git diff --check`.

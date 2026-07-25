# Task brief — OpenAI-compatible provider adapter

**Owner:** Hermes Agent

**Date:** 2026-07-25

**Status:** review

**Related plan:** `docs/planning/2026-07-25-openai-provider-implementation-plan.md`

## Objective

Expose an isolated subpath that can make a real OpenAI Responses API request and return only validated text or a safe typed failure.

## Scope

**In:**
- `@theorvane/type-mcp/openai` ESM/CJS/type export
- Fetch-based OpenAI Responses request formation and response validation
- Environment credential default and injected Fetch seam
- Behavior/package tests and public documentation

**Out:**
- Streaming, retries, a provider registry, model discovery, agent/tool loop, authentication flows, persistence, application framework integration

## Acceptance criteria

- [x] Valid input produces a single correctly authenticated `POST /responses` request and projects validated text.
- [x] Configuration, request, and response failures are typed and fixed-safe; tests prove no key/provider body leaks.
- [x] The new adapter stays outside root core, HTTP, and LangChain imports.
- [x] Focused red-green evidence and all repository verification checks are recorded.

## Files

- Create: `src/openai.ts`, `src/openai/create-openai-responses-provider.ts`
- Create: `test/openai-provider.test.ts`, `test/openai-package-contract.test.ts`
- Modify: `package.json`, `tsup.config.ts`, `scripts/verify-package-exports.mjs`
- Docs: `docs/architecture/adr/0003-openai-compatible-provider-adapter.md`, `docs/api/openai-provider.md`, `docs/guides/openai-provider.md`

## Red → green evidence

| Stage | Command | Result / expected reason |
| --- | --- | --- |
| Red | `npm test -- --run test/openai-package-contract.test.ts test/openai-provider.test.ts` | Observed expected failures: missing `./openai` export and `Cannot find module '../src/openai.js'`. |
| Green | `npm test -- --run test/openai-package-contract.test.ts test/openai-provider.test.ts` | 2 files, 5 tests passed. |
| Regression | `npm run lint && npm run typecheck && npm test && npm run build && npm run verify:package && npm run verify:publish && git diff --check` | Passed: Biome clean; strict typecheck; 26 files/60 tests; ESM/CJS/types exports; publish tarball contract; whitespace check. |

## Risks and boundaries

- Treat every HTTP/JSON value as `unknown`; provider error bodies may contain secrets or internal details and must not reach the public result.
- `baseUrl` is explicit host configuration, not discovery. Permit HTTPS and loopback HTTP only.
- Do not adopt OpenCode source or its multi-provider registry.

## Review handoff

- Spec review: pending
- Quality review: pending
- Final checks: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run verify:package`, `git diff --check`

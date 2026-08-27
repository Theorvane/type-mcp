# Task brief — Modern MCP component metadata

**Owner:** Codex

**Date:** 2026-08-27

**Status:** review

**Related plan:** GitHub issue `#170`

## Objective

Decorated tools, static resources, and prompts expose the modern MCP metadata
supported by the official TypeScript SDK 1.30.0 high-level server API.

## Scope

**In:**

- tool `title`, `annotations`, custom `_meta`, and Zod `outputSchema`
- static-resource `title`, `icons`, `annotations`, and custom `_meta`
- prompt `title`
- immutable definition reads, SDK compilation, behavior tests, and public API docs

**Out:**

- provider/transform architecture, OAuth, tasks, and resource templates
- tool icons and prompt icons/meta until the SDK high-level registration API supports them
- FastMCP 4 beta's sessionless protocol before official TypeScript SDK support

## Acceptance criteria

- [x] `tools/list` returns declared metadata and output schema, and structured output is SDK-validated.
- [x] `resources/list` returns declared metadata without changing static-resource behavior.
- [x] `prompts/list` returns the declared title.
- [x] Existing decorator calls remain source-compatible.
- [x] Focused tests, the full suite, typecheck, lint, build, and package verification pass.

## Files

- Create: `docs/planning/2026-08-27_issue-170-modern-mcp-metadata.md`
- Modify: `src/types.ts`, standard and legacy decorator implementations, metadata freezing, compiler registration
- Test: `test/decorators.test.ts`, `test/legacy-decorators.test.ts`, `test/tool-compilation.test.ts`, `test/resource-prompt-compilation.test.ts`
- Docs: `docs/api/decorator-api.md`, `README.md`

## Red → green evidence

| Stage | Command | Result / expected reason |
| --- | --- | --- |
| Red | `npx vitest run test/decorators.test.ts test/tool-compilation.test.ts test/resource-prompt-compilation.test.ts` | 4 failed, 11 passed; definitions and list responses dropped all new fields |
| Red (legacy) | `npx vitest run test/legacy-decorators.test.ts` | 1 failed, 1 passed; legacy decorators dropped the new fields |
| Green | focused commands above | 17 passed |
| Regression | `npm test` | 29 files, 72 tests passed |

## Risks and boundaries

- Public types reuse official SDK `Icon`, `Annotations`, and `ToolAnnotations` contracts.
- Zod schemas stay caller-owned executable objects and retain identity across definition reads.
- Metadata containers are defensively copied; server/component records are frozen without deep-freezing arbitrary custom values.
- Output validation and MCP protocol serialization remain delegated to the official SDK.

## Review handoff

- Spec review: approved on commit `d8847e7`; documentation boundary follow-up pending re-review
- Quality review: approved on commit `d8847e7`; documentation boundary follow-up pending re-review
- Final checks: lint, typecheck, 72 tests, build, package exports, publish tarball/consumer verification, and `git diff --check` passed

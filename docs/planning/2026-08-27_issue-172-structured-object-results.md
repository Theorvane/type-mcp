# Task brief — Structured object tool results

**Owner:** Codex

**Date:** 2026-08-27

**Status:** review

**Related plan:** GitHub issue `#172`

## Objective

A decorated tool can return a JSON-compatible object directly and TypeMCP emits
both backward-compatible text content and machine-readable structured content.

## Scope

**In:**

- object-result normalization in the core compiler
- explicit `CallToolResult` preservation
- text-only behavior for strings, primitives, and arrays
- SDK output-schema validation, behavior tests, and public API docs

**Out:**

- return-type reflection or automatic output-schema generation
- primitive wrapping under a synthetic result key
- media/file helper types

## Acceptance criteria

- [x] Object returns produce matching JSON text and `structuredContent`.
- [x] Declared `outputSchema` works with object shorthand and rejects invalid output safely.
- [x] Explicit MCP results remain unchanged.
- [x] Non-object JSON values remain text-only.
- [x] Focused/full verification and package checks pass.

## Red → green evidence

| Stage | Command | Result / expected reason |
| --- | --- | --- |
| Red | `npx vitest run test/tool-compilation.test.ts test/tool-result-normalization.test.ts` | 2 failed, 4 passed; object returns lacked `structuredContent` |
| Green | same focused command | 6 passed |
| Regression | `npm test` | 30 files, 74 tests passed |

## Risks and boundaries

- Structured content is produced from the JSON-serialized value, not an unchecked application object.
- Explicit SDK results are parsed and preserved before shorthand normalization.
- Output validation remains owned by the official SDK.

## Review handoff

- Spec review: pending
- Quality review: pending
- Final checks: lint, typecheck, build, package, publish, and diff checks passed

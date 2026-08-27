# Task brief — prompt arguments and resource templates

**Owner:** Codex

**Date:** 2026-08-27

**Status:** complete

**Related plan:** GitHub issue `#178`

**Base:** SDK v2 PR `#177`, merged to `dev` as `1871ea6`

## Objective

TypeMCP exposes explicit, validated prompt arguments and dynamic resource URI templates with completion through the MCP SDK v2 high-level APIs.

## Scope

**In:**

- optional prompt argument Zod object schemas and parsed handler input
- URI-template detection, variable validation, and parsed resource handler input
- prompt-field and resource-variable completion through SDK v2
- static resource and zero-argument prompt compatibility
- safe errors, immutable metadata containers, API/product/architecture/guide docs

**Out:**

- TypeScript reflection or implicit argument inference
- invocation context, progress/cancellation, visibility, tasks, OAuth, providers, OpenAPI, and MCP Apps

## Acceptance criteria

- [x] Prompt list/get exposes schema-derived arguments and invokes handlers with parsed input.
- [x] Template list/read exposes URI templates and invokes handlers with parsed variables.
- [x] Prompt and resource completion returns at most 100 SDK-normalized suggestions.
- [x] Invalid definitions and runtime inputs fail safely without application details.
- [x] Existing static/no-argument behavior and package entrypoints remain compatible.

## Red → green evidence

| Stage | Command | Result / expected reason |
| --- | --- | --- |
| Red | `npx vitest run test/resource-prompt-compilation.test.ts` | Prompt case failed because `arguments` was absent; template case failed because `resourceTemplates` was empty. |
| Green | focused declaration/compiler tests | 3 files and 24 tests passed, including validation and immutability. |
| Regression | `npm test` | 30 files and 84 tests passed. |

## Review handoff

- Spec review: ready for PR review
- Quality review: ready for PR review
- Final checks: lint, typecheck, tests, build, package/publish consumers, audit, and diff check passed

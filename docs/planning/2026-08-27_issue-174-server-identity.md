# Task brief — Server identity and instructions metadata

**Owner:** Codex

**Date:** 2026-08-27

**Status:** review

**Related plan:** GitHub issue `#174`

## Objective

A server decorator can declare standard MCP implementation identity and usage
instructions, and clients receive them during initialization.

## Scope

**In:**

- optional server `title`, `description`, `websiteUrl`, `icons`, and `instructions`
- standard and legacy decorator definition storage
- defensive freezing/copying for server icons and nested sizes
- SDK implementation identity and initialization instructions forwarding
- behavior tests and public product/API documentation

**Out:**

- OAuth, authorization, transport, or session changes
- tool/prompt icons unavailable in the SDK high-level registration API
- application-framework lifecycle or agent runtime integration

## Acceptance criteria

- [x] Standard and legacy decorators retain declared server metadata.
- [x] Definition reads expose frozen copied icon and size arrays.
- [x] Initialization publishes identity metadata and instructions.
- [x] Omitted optional fields preserve current behavior.
- [x] Focused/full verification and package checks pass.

## Red → green evidence

| Stage | Command | Result / expected reason |
| --- | --- | --- |
| Red | `npx vitest run test/decorators.test.ts test/legacy-decorators.test.ts test/streamable-http.test.ts` | 3 failed, 8 passed; server identity and instructions were discarded |
| Green | same focused command | 3 files, 11 tests passed |
| Regression | `npm test` | 30 files, 74 tests passed |

## Risks and boundaries

- Server identity fields follow the installed official SDK `Implementation` contract.
- `instructions` is passed through SDK server options and remains optional.
- Existing name/version-only decorators retain identical initialization behavior.

## Review handoff

- Spec review: pending
- Quality review: pending
- Final checks: lint, typecheck, build, package, publish, and diff checks passed

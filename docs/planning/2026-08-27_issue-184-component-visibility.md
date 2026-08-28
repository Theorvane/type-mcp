# Task brief — component visibility

**Owner:** Codex

**Date:** 2026-08-27

**Status:** complete

**Related plan:** GitHub issue `#184`

**Stacked base:** PR `#183` / `feat/182-testing-media` until merged to `dev`

## Objective

Decorated components can start disabled and compiled servers can safely reshape their exposed surface through SDK-native visibility handles.

## Scope

**In:** enabled, immutable validated tags, keys/names/tags/kinds filters, allowlist mode, native list/call behavior and notifications, docs.

**Out:** per-session policy, authentication, authorization, providers, versions, persistence, OAuth, and MCP Apps.

## Acceptance criteria

- [x] Static disabled state hides listings and blocks dispatch.
- [x] Runtime enable/disable filters match keys, names/URIs, tags, and kinds.
- [x] Allowlist mode produces the exact selected surface.
- [x] Tags are validated and frozen in definitions.
- [x] Existing untagged enabled components remain compatible.
- [x] Full package verification passes.

## Red → green evidence

| Stage | Command | Result / expected reason |
| --- | --- | --- |
| Red | `npx vitest run test/component-visibility.test.ts` | Failed as expected because decorator tags were not stored. |
| Green | `npx vitest run test/component-visibility.test.ts` | Passed: 2 tests cover static/runtime behavior, every filter family, allowlist mode, empty-filter safety, immutable tags, and invalid tags. |
| Regression | `npm test` | Passed: 34 files and 93 tests; lint, typecheck, build, package/publish packed consumers, production audit, and diff checks passed. |

## Review handoff

- Spec review: pending
- Quality review: pending
- Final checks: all required local checks passed

# Task brief — dev-default branch governance

**Owner:** Hermes Agent
**Date:** 2026-07-22
**Status:** in-progress
**Related issue:** https://github.com/Theorvane/type-mcp/issues/45

## Objective

Keep contributor workflow and all PR/push automation aligned with `dev` as the protected integration branch and `main` as release-only.

## Scope

**In:**
- CI and PR automation triggers for `dev` and `main`.
- Contributor instructions for branch origin, PR base, and release promotion.
- Regression contract for branch trigger coverage.

**Out:**
- Runtime/package behavior.
- Release publication or merging PR #44.

## Acceptance criteria

- [x] All workflow triggers include `[dev, main]`.
- [x] Contributor instructions send ordinary work to `dev` and reserve `main` for releases.
- [x] Focused branch-governance test passes with package verification.

## Files

- Modify: `.github/workflows/*.yml`, `AGENTS.md`, `CONTRIBUTING.md`
- Create: `test/branch-governance-workflow-contract.test.ts`

## Red → green evidence

| Stage | Command | Result |
| --- | --- | --- |
| Red | `test -f test/branch-governance-workflow-contract.test.ts` | failed: contract was absent |
| Green | `npx vitest run test/branch-governance-workflow-contract.test.ts` | pending |
| Regression | `npm run lint && npm run typecheck && npm test && npm run build` | pending |

## Risks and boundaries

- Required check context remains `verify`; no protection weakening.
- `main` remains protected for reviewed release promotion.

## Review handoff

- Spec review: pending
- Quality review: pending

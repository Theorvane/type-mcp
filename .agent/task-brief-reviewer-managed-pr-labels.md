# Task brief — reviewer-managed PR labels

**Owner:** Hermes Agent (`sjungwon03-ai`)

**Date:** 2026-07-21

**Status:** in-progress

**Related plan:** GitHub Issue #21

## Objective

Ensure that labels manually applied by PR authors do not remain on TypeMCP pull requests, while labels applied by the automated reviewer account are preserved.

## Scope

**In:**
- Trusted, event-driven label cleanup workflow for pull requests to `main`.
- Focused contract verification for the workflow.
- Maintainer-facing operational documentation.

**Out:**
- Changing collaborator roles or GitHub organization policy.
- Checking out or executing PR code from the label workflow.
- Automatically merging pull requests.

## Acceptance criteria

- [ ] A label added by a non-reviewer is automatically removed.
- [ ] A label set by `sjungwon03-ai` is preserved, including when a PR is reopened.
- [ ] Workflow runs only on pull-request events and uses the minimum API permissions required.
- [ ] Workflow does not check out PR code.
- [ ] Focused verification detects accidental removal of those constraints.

## Files

- Create: `.github/workflows/enforce-reviewer-managed-pr-labels.yml`
- Create: `scripts/verify-reviewer-label-policy.mjs`
- Create: `docs/guides/agile-delivery.md`
- Create: `.agent/task-brief-reviewer-managed-pr-labels.md`

## Red → green evidence

| Stage | Command | Result / expected reason |
| --- | --- | --- |
| Red | `node scripts/verify-reviewer-label-policy.mjs` | Failed as expected with `ENOENT`: enforcement workflow did not exist. |
| Green | `node scripts/verify-reviewer-label-policy.mjs` | Passed: reviewer-managed PR label workflow contract verified. A later regression test first failed on `reopened`, then passed after its removal. |
| Regression | `npm run typecheck && npm run lint && npm test && npm run build && npm run verify:package && npm run verify:publish` | Passed: 17 tests and all package gates. |

## Risks and boundaries

- GitHub does not expose a label-only permission. The workflow removes unauthorized labels after the associated event; it cannot revoke label UI controls from collaborators who have broad repository write/triage permissions.
- `pull_request_target` is used only for metadata API calls and must never check out or run head-branch code.

## Review handoff

- Spec review: pending
- Quality review: pending
- Final checks: `node scripts/verify-reviewer-label-policy.mjs`, package verification commands, `git diff --check`

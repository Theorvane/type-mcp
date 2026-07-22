# Task brief — automatic AI PR review request

**Owner:** Hermes Agent
**Date:** 2026-07-22
**Status:** complete
**Related issue:** [#37](https://github.com/Theorvane/type-mcp/issues/37)

## Objective

Request `sjungwon03-ai` to review every eligible non-draft pull request targeting `main`, without checking out or executing untrusted PR code.

## Scope

- Add one metadata-only `pull_request_target` workflow.
- Trigger on `opened`, `reopened`, `ready_for_review`, and `synchronize`.
- Skip drafts, AI-authored PRs, and duplicate outstanding review requests.
- Test the workflow's required security and behavior contract.
- Update Agile delivery documentation.

## Out of scope

- Calling an external LLM or storing provider secrets.
- Executing or inspecting PR checkout code inside this workflow.
- Replacing branch protection or required maintainer approval.

## TDD evidence

| Stage | Command | Result |
| --- | --- | --- |
| Red | `npm test -- --run test/pr-ai-review-workflow-contract.test.ts` | Failed as expected: workflow file absent. |
| Green | `npm test -- --run test/pr-ai-review-workflow-contract.test.ts` | Passed: trigger, AI reviewer request, permissions, and no-checkout/no-run contract verified. |
| Regression | `npm run lint && npm run typecheck && npm test && npm run build && npm run verify:package && npm run verify:publish` | Passed: 31 tests; lint/typecheck/build/package/publish contracts passed. `npm audit --omit=dev --audit-level=high` found no high-severity vulnerabilities. |

## Safety constraints

- Explicit least-privilege permissions: `contents: read`, `pull-requests: write`.
- No `actions/checkout`, shell `run`, or PR-provided code execution.
- `pull_request_target` is limited to GitHub REST metadata calls.

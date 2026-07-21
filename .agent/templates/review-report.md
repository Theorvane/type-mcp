# Review report — <change title>

**Reviewer:** <name/agent>

**Date:** YYYY-MM-DD

**Change / commit range:** `<base>..<head>`

**Review type:** specification | code-quality | release

## Sources reviewed

- Plan: `<docs/planning/...>`
- Product/API docs: `<paths>`
- Tests: `<paths and commands>`
- Diff: `<git diff command>`

## Findings

| Severity | Location | Finding | Required disposition |
| --- | --- | --- | --- |
| blocking | `<path:line>` | <fact-based issue> | Fix and add regression proof |
| important | `<path:line>` | <fact-based issue> | Fix or document approved exception |
| suggestion | `<path:line>` | <non-blocking improvement> | Optional |

Write `None` if no findings exist; do not omit this section.

## Acceptance coverage

| Criterion | Evidence | Status |
| --- | --- | --- |
| <criterion> | <test/doc/diff evidence> | pass | fail | deferred-with-approval |

## Verification observed

```text
<exact command and concise output/status>
```

## Decision

- [ ] Approved: no unresolved blocking or important finding.
- [ ] Changes requested: findings above must be resolved and re-reviewed.
- [ ] Not reviewable: identify missing evidence.

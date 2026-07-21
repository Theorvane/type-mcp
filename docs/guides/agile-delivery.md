# Agile delivery

TypeMCP uses GitHub Issues, milestones, labels, pull requests, and a reviewer-owned
label policy to keep small, verifiable work visible.

## Sprint cadence

- A sprint lasts **two weeks**.
- Create one GitHub milestone per sprint, with a start/end date in its title and a due
  date at the sprint end.
- Only issues labelled `status:ready` and sized `XS` through `L` may enter a sprint.
  Split `size:XL` work before planning it.
- Each implementation PR must link one focused issue using `Closes #<number>`.
- At sprint end, close completed issues, move unfinished work to the next milestone,
  and briefly record the reason for carry-over.

## Label taxonomy

Apply at most one label from each status, priority, size, and review group.

| Group | Labels | Purpose |
| --- | --- | --- |
| Type | `type:feature`, `type:bug`, `type:docs`, `type:test`, `type:tooling`, `type:chore`, `type:release` | Nature of the work |
| Area | `area:core`, `area:http`, `area:ci`, `area:docs` | Affected package surface |
| Priority | `priority:critical`, `priority:high`, `priority:medium`, `priority:low` | Sprint ordering |
| Status | `status:needs-triage`, `status:ready`, `status:in-progress`, `status:blocked` | Delivery state |
| Size | `size:XS`, `size:S`, `size:M`, `size:L`, `size:XL` | Planning estimate |
| Review | `review:approved`, `review:changes-requested`, `review:commented` | Automated reviewer outcome |

## Pull request label policy

`sjungwon03-ai` is the only account that retains labels on a pull request. The
`Enforce reviewer-managed PR labels` workflow removes labels that any other actor
adds when a PR is opened, reopened, or labelled. The scheduled reviewer assigns the
appropriate `review:*` label only after it has completed a review for the current
head commit.

The workflow deliberately uses `pull_request_target` **only** to call GitHub's label
API. It must never check out or execute code from the PR branch.

GitHub does not offer a label-only collaborator permission. This policy is therefore
an automatic enforcement mechanism, not a way to remove the label UI from a
collaborator with broader write or triage privileges. If stricter access control is
needed, restrict collaborator roles in GitHub in addition to keeping this workflow
active.

## Minimal ceremony

1. Triage a new issue: add type, area, priority, status, and size labels.
2. Put ready issues in the current sprint milestone.
3. Create one branch and PR per issue.
4. Let CI and the automated reviewer determine merge readiness.
5. Use the reviewer-owned `review:*` label as the PR's current review state.

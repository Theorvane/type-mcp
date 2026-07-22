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
| Area | `area:core`, `area:http`, `area:ci`, `area:docs`, `area:community`, `area:security` | Affected package surface or community operation |
| Priority | `priority:critical`, `priority:high`, `priority:medium`, `priority:low` | Sprint ordering |
| Status | `status:needs-triage`, `status:needs-info`, `status:ready`, `status:in-progress`, `status:blocked` | Delivery state |
| Cross-cutting | `dependencies`, `breaking-change`, `good first issue`, `help wanted` | Dependency, compatibility, and contributor discovery signals |
| Size | `size:XS`, `size:S`, `size:M`, `size:L`, `size:XL` | Planning estimate |
| Review | `review:approved`, `review:changes-requested`, `review:commented` | Automated reviewer outcome |

## Pull request label policy

PR이 opened, reopened, ready-for-review, 또는 synchronize 상태가 되면 `Request AI pull-request review` workflow가 reviewer를 자동 요청합니다. workflow는 `pull_request_target`을 **GitHub PR metadata API 호출에만** 사용하며, PR branch를 checkout하거나 실행하지 않습니다. Draft PR과 이미 요청된 reviewer는 건너뜁니다. AI account (`sjungwon03-ai`)가 author이면 `sjungwon03`에게, 그 외에는 `sjungwon03-ai`에게 review를 요청하므로 self-review 요청을 만들지 않습니다.

`sjungwon03-ai`는 현재 head commit을 검토한 뒤에만 적절한 `review:*` label을 부여합니다.

두 workflow 모두 `pull_request_target`을 **GitHub metadata API 호출에만** 사용합니다. PR branch를 checkout하거나 PR code를 실행해서는 안 됩니다.

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

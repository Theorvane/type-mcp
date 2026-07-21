# Agent Harness

`.agent/` is committed project operating context for people and coding agents. It is **not** a runtime dependency, configuration source for published packages, or a substitute for `AGENTS.md`.

## Contents

| Path | Purpose | Use when |
| --- | --- | --- |
| `checklists/pre-commit.md` | Required local quality gate | Before every commit |
| `checklists/release-readiness.md` | Publication and remote-state gate | Before pushing a release or reporting a published repository |
| `templates/task-brief.md` | Scope, acceptance, red/green evidence, and risk record | Any multi-file or externally visible task |
| `templates/review-report.md` | Independent spec and quality review record | After a task or before publication |

## Workflow

1. Read `AGENTS.md`, then the matching files under `docs/`.
2. For a non-trivial task, copy the task brief template into the active change record or issue context; keep it out of runtime package directories.
3. Follow the red → green → refactor loop and retain command evidence.
4. Ask an independent reviewer to assess specification compliance first, then code quality.
5. Complete the pre-commit checklist. For remote publication, complete release readiness as well.

## Ownership boundaries

- Implementer: scope control, failing-test evidence, minimal implementation, docs updates.
- Spec reviewer: verifies every acceptance criterion and intentional exclusion.
- Quality reviewer: checks type safety, API design, tests, errors, package boundaries, and documentation accuracy.
- Publisher: runs fresh full verification and proves local/remote commit identity.

A review finding is unresolved until it is either fixed with verification or explicitly accepted by the user in writing.

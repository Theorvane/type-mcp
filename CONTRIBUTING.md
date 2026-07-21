# Contributing to type-mcp

## Before changing code

1. Read [AGENTS.md](AGENTS.md), the relevant document in [docs/](docs/README.md), and the task in [the MVP plan](docs/planning/2026-07-21-mvp-implementation-plan.md).
2. Keep the core framework-neutral: no NestJS dependency or import in `packages/core`.
3. Confirm whether the requested behavior is MVP scope. Add an ADR and revised plan before implementing a deferred capability.

## Development loop

```bash
npm ci
npm test -- --run <focused-test-file>
npm run typecheck
npm test
npm run build
```

Write and run a failing test first. Implement the smallest behavior that makes it pass, then run the affected suite and full verification as applicable.

## Required issue → branch → PR flow

All work after the initial repository bootstrap follows this flow. **Never commit directly to `main`.**

1. Search open work, then create one focused GitHub Issue with scope and verification criteria.
2. Create a branch from updated `main` named `<type>/<issue-number>-<description>`.
   - Examples: `feat/12-tool-compiler`, `fix/19-safe-error-result`, `docs/24-http-guide`.
3. Use focused conventional commits, e.g. `feat(core): add MCP tool decorator`.
4. Push the issue branch and open one PR against `main`.
5. Include `Closes #<issue-number>` in the PR body so GitHub closes the matching issue after merge.
6. Include exact verification commands/results, then resolve specification and code-quality review findings.
7. Squash merge only when CI is green; confirm the issue is closed and local `main` matches `origin/main`.

Keep generated files, credentials, local logs, coverage, and `node_modules/` out of commits. Update public docs for changed behavior and complete [.agent/checklists/pre-commit.md](.agent/checklists/pre-commit.md) before committing.

## Review expectations

Review in two passes:

1. **Specification compliance:** all acceptance criteria and non-goals are respected.
2. **Code quality:** test-first evidence, type safety, runtime validation, package boundaries, safe errors, and docs.

Use [.agent/templates/review-report.md](.agent/templates/review-report.md) to record findings when a change is non-trivial.

## Publication

The current repository target is private. Before creating/pushing the remote repository or reporting delivery, complete [.agent/checklists/release-readiness.md](.agent/checklists/release-readiness.md).

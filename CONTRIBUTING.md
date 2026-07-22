# Contributing to TypeMCP

Thank you for contributing. TypeMCP is an open-source TypeScript project released under the [MIT License](LICENSE). By submitting a contribution, you agree to license it under that license and to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Before changing code

1. Read [AGENTS.md](AGENTS.md), the relevant document in [docs/](docs/README.md), and the active task in [the single-package migration plan](docs/planning/2026-07-21-single-package-migration.md) or a later approved plan.
2. Keep the root package framework-neutral: no NestJS dependency or import in `src/`.
3. Confirm whether the requested behavior is MVP scope. Add an ADR and revised plan before implementing a deferred capability.

## Development loop

```bash
npm ci
npm test -- --run <focused-test-file>
npm run typecheck
npm run lint
npm test
npm run build
npm run verify:package
npm run verify:publish
```

Write and run a failing test first. Implement the smallest behavior that makes it pass, then run the affected suite and full verification as applicable.

## Required issue → branch → PR flow

All work after the initial repository bootstrap follows this flow. **Never commit directly to protected `dev` or `main`.**

1. Search open work, then create one focused GitHub Issue with scope and verification criteria.
2. Create a branch from updated `dev` named `<type>/<issue-number>-<description>`.
   - Examples: `feat/12-tool-compiler`, `fix/19-safe-error-result`, `docs/24-http-guide`.
3. Use focused conventional commits, e.g. `feat(core): add MCP tool decorator`.
4. Push the issue branch and open one PR against `dev`.
5. Include `Closes #<issue-number>` in the PR body so GitHub closes the matching issue after merge.
6. Include exact verification commands/results, then resolve specification and code-quality review findings.
7. Squash merge only when CI is green; confirm the issue is closed and local `dev` matches `origin/dev`.
8. Use a separate reviewed PR from `dev` to release-only `main` when promoting a release.

Keep generated files, credentials, local logs, coverage, and `node_modules/` out of commits. Update public docs for changed behavior and complete [.agent/checklists/pre-commit.md](.agent/checklists/pre-commit.md) before committing.

## Review expectations

Review in two passes:

1. **Specification compliance:** all acceptance criteria and non-goals are respected.
2. **Code quality:** test-first evidence, type safety, runtime validation, package boundaries, safe errors, and docs.

Use [.agent/templates/review-report.md](.agent/templates/review-report.md) to record findings when a change is non-trivial.

## Security and support

- Check [SECURITY.md](SECURITY.md) before handling a suspected vulnerability. A private reporting channel is not configured yet, so do not submit sensitive details in public issues or pull requests.
- For usage and contribution questions, read [SUPPORT.md](SUPPORT.md) and use the **Question or contribution support** issue form if the question remains unresolved.

## Maintainer review

Maintainers triage new reports, request missing reproduction details when needed, and review changes for specification compliance and code quality. A contribution is ready to merge only after the linked issue is scoped, CI is green, review findings are resolved, and the PR template is complete.

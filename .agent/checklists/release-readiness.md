# Release / publication readiness checklist

Use before pushing a release candidate, creating a remote repository, publishing packages, or reporting the project as delivered.

## Fresh verification

- [ ] `npm ci` completed successfully from the lockfile.
- [ ] `npm run typecheck` completed successfully.
- [ ] `npm test` completed successfully.
- [ ] `npm run build` completed successfully.
- [ ] `git diff --check` completed successfully.
- [ ] The working tree is clean after all verification.

## Product and package contract

- [ ] README accurately distinguishes implemented features from planned features.
- [ ] Package names, exports, dependency/peer dependency ranges, and license are reviewed.
- [ ] API docs include Accept / Error / Excluded behavior where applicable.
- [ ] Architecture docs still match the package boundaries.
- [ ] Examples run against built or workspace packages and do not imply unsupported NestJS functionality.

## Security and repository state

- [ ] No credentials, `.env`, private keys, test tokens, coverage, or generated `dist/` output are tracked.
- [ ] Dependency changes were intentionally reviewed.
- [ ] The repository visibility matches the approved scope (**private** for `sjungwon03/type-mcp`).
- [ ] `git rev-parse HEAD` equals `git ls-remote origin refs/heads/main` after push.
- [ ] `gh repo view sjungwon03/type-mcp --json url,visibility,defaultBranchRef` confirms private `main`.

## Review

- [ ] Specification review found no unresolved acceptance gaps.
- [ ] Code-quality review found no unresolved blocking issue.
- [ ] Any deferred feature is stated explicitly in the final report.

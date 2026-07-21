# Open-source operations checklist

The repository is public. Use this checklist to finish and periodically audit the operational safeguards that remain after public launch.

## Repository content

- [ ] Review the full Git history, current files, GitHub Actions logs, releases, issue/PR bodies, and npm metadata for credentials, private URLs, personal data, and internal-only material.
- [ ] Verify that `LICENSE`, `README.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, and `SUPPORT.md` are present and current on `main`.
- [ ] Verify issue forms and the pull-request template render correctly on GitHub.
- [ ] Confirm the package name, license, copyright owner, and public documentation are intentional.

## GitHub settings

- [x] Repository is public.
- [ ] Enable private vulnerability reporting and confirm the Security tab accepts private reports. Until this is complete, `SECURITY.md` must not claim a working private channel.
- [ ] Publish and monitor a private Code of Conduct reporting contact.
- [x] Confirm Issues are enabled; enable Discussions only if maintainers commit to monitoring it.
- [ ] Add repository topics: `model-context-protocol`, `mcp`, `typescript`, `decorators`, `zod`, and `streamable-http`.
- [ ] Verify squash merging and automatic deletion of merged head branches are enabled.
- [x] Protect `main`: require the `verify` status check, require branches to be up to date, require approvals for external contributors, and block direct pushes.

## Release and operations

- [ ] Run `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run verify:package`, `npm run verify:publish`, `npm audit --omit=dev --audit-level=high`, and `git diff --check`.
- [ ] Complete [npm release readiness](npm-release.md) separately before any new package publication.
- [ ] Publish a maintainer policy for security/CODE OF CONDUCT reporting contacts, triage, review turnaround, and supported versions once a regular release cadence is chosen.

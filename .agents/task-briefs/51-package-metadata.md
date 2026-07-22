# Task brief — correct package metadata

**Owner:** Hermes Agent

**Date:** 2026-07-23

**Status:** review

**Related issue:** [Theorvane/type-mcp#51](https://github.com/Theorvane/type-mcp/issues/51)

## Objective

Publish canonical TypeMCP repository, homepage, and issue-tracker metadata in the next `type-mcp` npm release while keeping public clone and release guidance accurate.

## Scope

**In:**
- `package.json` repository, homepage, and bugs URLs.
- A publish-manifest contract test.
- Public README, release-checklist, and repository-address guidance updates.

**Out:**
- Publishing a new npm version or changing runtime exports.
- Changing package scope, version, or release workflow.

## Acceptance criteria

- [x] Manifest points repository and bugs to `Theorvane/type-mcp`.
- [x] Manifest homepage is `https://typemcp.theorvane.tech`.
- [x] A regression test rejects legacy metadata.
- [x] Public clone and release guidance use the canonical repository.

## Red → green evidence

| Stage | Command | Result |
| --- | --- | --- |
| Red | `npm test -- --run test/publish-contract.test.ts` | Failed: repository URL was `git+https://github.com/sjungwon03/type-mcp.git`. |
| Green | `npm test -- --run test/publish-contract.test.ts` | Passed: 1 test. |
| Regression | `npm run lint && npm run typecheck && npm test && npm run build && npm run verify:package && npm run verify:publish && npm audit --omit=dev --audit-level=high && git diff --check` | Passed: Biome, TypeScript, 34 Vitest tests, build, export/tarball verification, high-severity audit gate, and whitespace check. The audit reports two pre-existing moderate `@hono/node-server` findings; the available fix requires a breaking SDK downgrade and is out of scope. |

## Risks and boundaries

- Registry metadata for the immutable published `type-mcp@0.1.0` cannot be edited retroactively; the corrected manifest takes effect in the next approved release.
- Independent review found outdated public-repository/release instructions after the metadata correction. The checklist now distinguishes normal `dev` PRs from separately reviewed `dev` → `main` promotions; historical bootstrap material is explicitly marked obsolete and reflects the current public repository and `dev` default branch.
- Independent review also found two active issue-template links targeting the unrelated former `sloki-code/type-mcp` repository; both now use canonical `Theorvane/type-mcp` links on `dev`.

- Spec review: pending
- Quality review: pending
- Final checks: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run verify:package`, `npm run verify:publish`, `npm audit --omit=dev --audit-level=high`, and `git diff --check`.

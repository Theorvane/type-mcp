# Pre-commit checklist

Use this checklist immediately before every commit.

## Scope

- [ ] A focused GitHub Issue exists and this branch name includes its number: `<type>/<issue-number>-<description>`.
- [ ] The diff implements only the linked issue's coherent intent.
- [ ] No unrelated formatting, generated output, dependency cache, secret, or local environment file is included.
- [ ] Files are located in the correct package/layer; `core` has no application-framework dependency and LangChain remains isolated in its subpath.
- [ ] Any public API addition/change has matching docs and behavior tests.

## Test-first evidence

- [ ] A focused test was written before the implementation.
- [ ] The test was run and failed for the expected missing-behavior reason.
- [ ] The minimal implementation was added only after the red result.
- [ ] The focused test now passes.
- [ ] Relevant package tests pass.

## Quality and safety

- [ ] `npm run typecheck` passes for TypeScript changes.
- [ ] No `any`, `@ts-ignore`, unsafe cast, or stack trace exposure was introduced.
- [ ] Runtime input crosses a validation boundary before use.
- [ ] Expected user/application failures have safe errors and tests.
- [ ] `git diff --check` passes.

## Commit

- [ ] `git diff --cached` was read line-by-line.
- [ ] Commit subject uses a conventional, imperative format.
- [ ] `git status --short --branch` is understood before committing.

## Summary

<!-- Briefly describe the change. -->

## Linked issue

Closes #

## Verification

- [ ] When code behavior changes: a focused test was written first and observed failing for the intended missing behavior.
- [ ] For docs/config-only changes: the relevant links, forms, or configuration were validated instead.
- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] `npm run verify:package`
- [ ] `npm run verify:publish`
- [ ] `git diff --check`

## Contributor checklist

- [ ] This PR has one focused purpose and follows `<type>/<issue-number>-<description>` branch naming.
- [ ] Public API changes include behavior tests and API documentation.
- [ ] Runtime input is validated and errors do not expose application stacks, secrets, or private data.
- [ ] I did not add application-framework imports/dependencies to the framework-neutral core; LangChain stays isolated in `@theorvane/type-mcp/langchain`.
- [ ] I updated relevant docs and removed generated artifacts, credentials, and local logs.
- [ ] I agree to follow the Code of Conduct and license this contribution under the MIT License.

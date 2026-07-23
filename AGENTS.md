# type-mcp — Agent & Contributor Instructions

## Purpose

`type-mcp` is an open-source TypeScript repository for one unscoped, decorator-first MCP server package. The root export provides the framework-neutral metadata/core API; `type-mcp/http` is its Fetch/Streamable HTTP subpath; `type-mcp/langchain` converts decorated tools to LangChain structured tools. The runtime core remains independent of agent and application frameworks.

## Source-of-truth hierarchy

1. User request and approved product decisions
2. `docs/product/` and `docs/architecture/`
3. `docs/planning/` for executable task order and acceptance criteria
4. This file for repository operating rules
5. Package README/API documentation

If sources conflict, stop and update the lower-priority document before implementation. Never silently implement against stale documentation.

## Repository boundaries

- `src/`: decorators, metadata, validation/compiler, resolver contract, and stdio helper. **No application-framework imports.**
- `src/langchain.ts`: tools-only LangChain adapter subpath. It may import `@langchain/core`, but never LangGraph or application framework packages.
- `src/http.ts`: Fetch `Request → Response` Streamable HTTP subpath entry point. It may depend on root runtime contracts but not the reverse.
- `examples/`: runnable, minimal usage—not a second framework implementation.
- `docs/`: canonical human-facing product, architecture, API, guide, and planning documents.
- `.agents/`: tracked agent operating aids; never imported by package runtime code.
- `dist/`, coverage, logs, and installed dependencies are generated output and must not be hand-edited or committed.

## Non-negotiable engineering rules

1. **Test first.** Write one focused failing Vitest test, run it and confirm the expected failure, then write the smallest production code to pass it.
2. **Strict TypeScript.** Do not introduce `any`, `@ts-ignore`, implicit `undefined` behavior, or unchecked external data. Accept runtime input as `unknown`, then validate it.
3. **Explicit public contracts.** Exported APIs need typed options, behavior tests, documentation, and semver-conscious names.
4. **Safe MCP errors.** Validation and handler failures return safe MCP error content; never send application stack traces or secrets to clients.
5. **Framework neutrality.** Core knows only the resolver interface. LangChain interoperability belongs in the `type-mcp/langchain` subpath; LangGraph graphs, model calls, and application lifecycles remain consumer responsibilities.
6. **YAGNI.** Do not add OAuth, persistence, legacy SSE, resource templates, application-framework modules, or graph runtimes unless a separately approved scope document changes.
7. **Small commits.** One intent per commit with a conventional message. Do not mix formatting churn or unrelated refactors into feature work.

## Required issue → branch → PR workflow

Every change after the initial repository bootstrap follows this sequence. Never commit directly to protected `dev` or `main`.

1. Inspect existing open issues and PRs, then create or update one focused GitHub Issue before branching.
2. Put the issue number in the branch: `<type>/<issue-number>-<short-description>` — for example, `feat/12-tool-compiler` or `chore/1-strict-workspace-baseline`.
3. Branch from the current `origin/dev` unless a documented stacked PR requires another base.
4. Implement one coherent issue only. Commit with conventional format: `type(scope): subject`.
5. Push the branch and open a PR against `dev` with `Closes #<issue-number>` in the body.
6. Run and report fresh verification evidence; obtain specification and code-quality review before merge.
7. Squash merge only after CI/review passes, then verify the issue is closed and `dev` contains the merged commit.
8. Promote vetted `dev` to release-only `main` in a separate reviewed release PR; verify `main` contains the release commit before publication.

## Required loop for every code task

1. Read the linked GitHub Issue, relevant product/architecture/API docs, and precise task in `docs/planning/`.
2. Create a task brief from `.agents/templates/task-brief.md` if the change touches more than one behavior.
3. Add one failing test near the behavior under test.
4. Run the focused test and record the expected failure in the task brief or commit context.
5. Implement the smallest safe change.
6. Re-run the focused test, then affected package tests.
7. Run `npm run typecheck` when changing TypeScript public or internal source.
8. Update README/API/architecture docs for user-visible behavior or decisions.
9. Review the exact diff and complete `.agents/checklists/pre-commit.md`.
10. Commit only after the required checks pass; push and open/update the linked PR.

## Verification commands

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm run verify:package
npm run verify:publish
git diff --check
git status --short --branch
```

Before pushing or claiming completion, all applicable commands above must complete successfully in the current worktree. For a release or external publication, also complete `.agents/checklists/release-readiness.md` and verify remote `main` matches local `HEAD`.

## Documentation rules

- Product intent: `docs/product/`
- Architecture/decision records: `docs/architecture/`
- Public API behavior and A/E/X tables: `docs/api/`
- Developer integration guides: `docs/guides/`
- Approved executable work breakdown: `docs/planning/`
- Design history: `docs/superpowers/specs/`

Use Korean or English consistently within each document. Code identifiers and command output remain in English. Do not present planned APIs as implemented APIs.

## Definition of done

A task is complete only when its specified behavior has a test that was observed failing before implementation, the focused and affected suites pass, strict typecheck/build pass where applicable, docs are current, the pre-commit checklist is satisfied, and the committed diff contains only the intended change.

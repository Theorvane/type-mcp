# Reference-first TypeMCP usage guides implementation plan

> **For Hermes:** Execute each task with test-first documentation contracts. Record the focused red command before authoring user-facing guide content.

**Goal:** Add a detailed, release-accurate TypeMCP reference and Petstore walkthrough that routes developers from declaration to their chosen published runtime boundary.

**Architecture:** Keep `docs/` canonical. A documentation contract test protects the entry points and responsibility boundaries; a new Petstore walkthrough links to the existing verified stdio, Fetch/Streamable HTTP, and tools-only LangChain surfaces instead of duplicating their runtime implementation. Existing examples remain the executable proof.

**Tech stack:** Markdown, Node 20+, TypeScript standard decorators, Vitest, existing repository examples.

**Issue:** #115

---

## Task 1: Protect the reference-first information architecture with a documentation contract

**Files:**
- Create: `test/reference-documentation-contract.test.ts`

1. Write a Vitest test that reads `docs/README.md`, `docs/guides/core-concepts.md`, and `docs/guides/petstore-walkthrough.md`.
2. Require the published `@theorvane/type-mcp@0.2.2` version, four task entry points (inspect/stdio/HTTP/LangChain), an explicit resolver, the verified Petstore tool name, and application-owned hosting/authorization/model/LangGraph boundaries.
3. Run `npm test -- --run test/reference-documentation-contract.test.ts` and record RED because the new guide files do not exist.
4. Do not edit runtime source or package metadata.

## Task 2: Add core-concepts and Petstore walkthrough documents

**Files:**
- Create: `docs/guides/core-concepts.md`
- Create: `docs/guides/petstore-walkthrough.md`

1. Write `core-concepts.md`: declaration metadata, definition validation/compiler, explicit resolver, runtime/transport selection, safe ownership boundary, and links to the exact API/guide pages.
2. Write `petstore-walkthrough.md`: prerequisites, install, Stage 3 decorator configuration, `src/petstore-server.ts`, `src/server.ts`, expected definition/compiler result, stdio/HTTP/LangChain choices, ownership callouts, and next-step links.
3. Use only real exports and signatures already exercised by `test/standalone-http-example.test.ts` and `test/langgraph-tool-node.test.ts`.
4. Run the new focused contract test and confirm GREEN.

## Task 3: Reorganize the canonical docs index around reader goals

**Files:**
- Modify: `docs/README.md`
- Modify: `docs/guides/getting-started.md`
- Modify: `docs/guides/runtime-selection.md`

1. Lead the docs index with “start with a goal” links for declaration inspection, local stdio, Fetch/Next.js HTTP, and LangChain reuse; retain all existing public docs links.
2. Update getting started and runtime selection with direct links to the new concepts/walkthrough without changing runtime claims.
3. Keep operational/repository-process guidance reachable but visually/textually subordinate to first-run library usage.
4. Run focused documentation contract plus `test/langchain-documentation-contract.test.ts`, `test/standalone-http-example.test.ts`, and `test/langgraph-tool-node.test.ts`.

## Task 4: Validate release accuracy and deliver source handoff evidence

**Files:**
- Modify: `.agents/task-briefs/115-reference-first-usage-guides.md`

1. Record actual RED/GREEN commands and the canonical source handoff condition: no website source pin moves until this branch is independently reviewed, merged to `dev`, and promoted to `main`.
2. Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run verify:package`, `npm run verify:publish`, and `git diff --check`.
3. Inspect the exact diff and untracked files, commit the focused documentation change, push, and open a PR to `dev` with `Closes #115`.
4. Request latest-head independent review; do not merge or advance a website manifest from this branch.

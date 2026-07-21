# type-mcp MVP Implementation Plan

> **For Hermes:** Implement this plan task-by-task using test-driven development. Every production behavior starts with a focused failing Vitest test; run the test before and after the smallest implementation.

**Goal:** Publish a private, decorator-first TypeScript MCP framework with a framework-neutral core, a Fetch-compatible Streamable HTTP adapter, and an explicit NestJS integration seam.

**Architecture:** `@type-mcp/core` stores declarative class/method metadata and compiles it into the official MCP SDK's `McpServer`. Instance creation is delegated through a narrow `InstanceResolver` contract so a later NestJS package can provide DI-backed resolution without adding a Nest dependency to the core. `@type-mcp/http` adapts compiled servers to Fetch `Request → Response` handlers using the MCP SDK's Web Standard Streamable HTTP transport.

**Tech Stack:** TypeScript (strict mode, stage-3 decorators), npm workspaces, `@modelcontextprotocol/sdk`, Zod, Vitest, tsup, GitHub Actions, Node 22 LTS.

---

## Delivery constraints

- The repository must remain an npm workspace with two publishable packages: `@type-mcp/core` and `@type-mcp/http`.
- `@type-mcp/core` must not import NestJS packages.
- All public runtime input must be typed as `unknown` until validated; no public `any`, `@ts-ignore`, or unsafe error stack exposure.
- No authentication, resource templates, persistence layer, legacy SSE transport, or Nest module is included in this MVP.
- Each completed task is committed with a focused conventional commit.

## Acceptance matrix

| Area | Accept | Error | Excluded |
| --- | --- | --- | --- |
| Decorators | Class and methods produce immutable definitions | Missing server metadata and duplicate public names fail at compilation | Parameter decorators and reflection-based inferred schemas |
| Tools | Zod schema validates object input; sync/async handlers resolve | Invalid arguments and thrown handler errors become safe MCP errors | Automatic authorization and retries |
| Resources/prompts | Static URI resource and named prompt register through the SDK | Invalid decorator options fail before server becomes usable | URI templates and prompt argument inference |
| Resolver | Default constructor resolver and custom resolver work | Resolver rejection fails server construction clearly | Nest scope/context implementation |
| HTTP | Fetch handler processes MCP streamable HTTP requests | Unsupported method returns valid HTTP error; sessions follow SDK transport behavior | OAuth, Redis/session persistence, legacy SSE |
| Packaging | strict typecheck, tests, package builds, CI all pass | build/type/test failures block publishing | npm publication/release automation |

## Task 1: Establish contributor and agent harness

**Objective:** Make repository rules, task ownership, quality gates, and documentation locations discoverable before source code is introduced.

**Files:**
- Create: `AGENTS.md`
- Create: `.agent/README.md`
- Create: `.agent/checklists/pre-commit.md`
- Create: `.agent/checklists/release-readiness.md`
- Create: `.agent/templates/task-brief.md`
- Create: `.agent/templates/review-report.md`
- Create: `CONTRIBUTING.md`

**Step 1:** Write `AGENTS.md` with source-of-truth hierarchy, package boundaries, mandatory TDD flow, exact verification commands, safe commit rules, and a ban on manually editing generated `dist/` output.

**Step 2:** Write `.agent/README.md` to explain that `.agent/` is repository-tracked operational context rather than a runtime dependency. Link each checklist/template and define the implementer → reviewer handoff.

**Step 3:** Add concise pre-commit and release checklists with checkable criteria: clean status, focused diff review, `npm run typecheck`, `npm test`, `npm run build`, README/API compatibility review, and remote-head verification before publication.

**Step 4:** Add reusable task and review report templates that demand exact files, red/green evidence, commands, findings, and disposition.

**Step 5:** Run `git diff --check` and manually confirm all internal Markdown links resolve.

**Step 6:** Commit.

```bash
git add AGENTS.md CONTRIBUTING.md .agent/
git commit -m "docs: add contributor and agent harness"
```

## Task 2: Establish product and technical documentation information architecture

**Objective:** Turn the approved design into navigable project documentation before code is introduced.

**Files:**
- Create: `README.md`
- Create: `docs/README.md`
- Create: `docs/product/vision.md`
- Create: `docs/product/mvp-scope.md`
- Create: `docs/architecture/overview.md`
- Create: `docs/architecture/adr/0001-framework-neutral-core.md`
- Create: `docs/architecture/adr/0002-fetch-streamable-http.md`
- Create: `docs/api/decorator-api.md`
- Modify: `docs/superpowers/specs/2026-07-21-type-mcp-design.md`

**Step 1:** Write the root README with the framework purpose, MVP status, intended package layout, planned decorator API, and links to documentation. Label APIs as planned until their implementation is merged.

**Step 2:** Write a docs index that links product, architecture, API, planning, and the original approved design.

**Step 3:** Write product vision and MVP-scope documents. Explicitly distinguish user problems, primary users, success criteria, included work, and non-goals.

**Step 4:** Write architecture overview plus ADRs documenting (a) core/NestJS decoupling through `InstanceResolver`, and (b) Fetch-first Streamable HTTP transport.

**Step 5:** Write decorator API documentation with examples and Accept/Error/Excluded behavior tables. Do not document uncommitted behavior as available.

**Step 6:** Add a pointer from the original design document to the canonical docs index and this implementation plan.

**Step 7:** Run the Markdown link validation script and `git diff --check`.

**Step 8:** Commit.

```bash
git add README.md docs/
git commit -m "docs: add type-mcp product and architecture docs"
```

## Task 3: Create strict workspace and test/build baseline

**Objective:** Create the smallest installable monorepo with reproducible typecheck, test, lint, and build commands.

**Files:**
- Create: `package.json`
- Create: `package-lock.json`
- Create: `tsconfig.base.json`
- Create: `packages/core/package.json`
- Create: `packages/core/tsconfig.json`
- Create: `packages/http/package.json`
- Create: `packages/http/tsconfig.json`
- Create: `vitest.config.ts` (Vitest 4 root config with package test glob)
- Create: `.gitignore`
- Create: `.github/workflows/ci.yml`
- Create: `packages/core/src/index.ts`
- Create: `packages/core/test/package-contract.test.ts`
- Create: `packages/http/src/index.ts`
- Create: `packages/http/test/package-contract.test.ts`

**Step 1: Write failing tests** for each package's intended import surface. Core must export the `createMcpServer` symbol; HTTP must export `createMcpHandler`.

**Step 2: Verify red** with `npm test -- --run packages/core/test/package-contract.test.ts packages/http/test/package-contract.test.ts`; expected failure is unresolved exports.

**Step 3: Create the minimum workspace configuration and placeholder exports** to make those tests pass. Enable `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, and `useUnknownInCatchVariables`.

**Step 4: Verify green** using the focused test command.

**Step 5: Add CI** to run `npm ci`, `npm run typecheck`, `npm test`, and `npm run build` on Node 22.

**Step 6: Run the full local gate.**

```bash
npm ci
npm run typecheck
npm test
npm run build
git diff --check
```

**Step 7: Commit.**

```bash
git add package.json package-lock.json tsconfig.base.json vitest.config.ts eslint.config.mjs scripts/ .gitignore .github packages/
git commit -m "chore: scaffold strict TypeScript workspace"
```

## Task 4: Define public contracts and decorator metadata storage

**Objective:** Provide typed definitions and independent decorator behavior without importing the MCP SDK compiler.

**Files:**
- Create: `packages/core/src/types.ts`
- Create: `packages/core/src/metadata/keys.ts`
- Create: `packages/core/src/metadata/definitions.ts`
- Create: `packages/core/src/decorators/mcp-server.ts`
- Create: `packages/core/src/decorators/mcp-tool.ts`
- Create: `packages/core/src/decorators/mcp-resource.ts`
- Create: `packages/core/src/decorators/mcp-prompt.ts`
- Modify: `packages/core/src/index.ts`
- Create: `packages/core/test/decorators.test.ts`

**Step 1: Write failing tests** for class metadata, method metadata, defaulting a component name to the method name, preserving descriptions/options, and keeping each class's metadata independent.

**Step 2: Verify red** with `npm test -- --run packages/core/test/decorators.test.ts`.

**Step 3: Implement minimal metadata keys, immutable copied definitions, and stage-3 TypeScript decorators.** Do not use `reflect-metadata`; use a `WeakMap` keyed by class constructor to keep the core dependency-free.

**Step 4: Verify green** with the focused test command.

**Step 5: Add type-level coverage** to ensure decorator option input accepts Zod object schemas and handler method names only.

**Step 6: Commit.**

```bash
git add packages/core/src packages/core/test/decorators.test.ts
git commit -m "feat(core): add MCP decorators and metadata"
```

## Task 5: Implement definition reader and compile-time validation

**Objective:** Normalize server definitions and fail fast before registering invalid components.

**Files:**
- Create: `packages/core/src/metadata/read-server-definition.ts`
- Create: `packages/core/src/errors.ts`
- Create: `packages/core/test/definition-reader.test.ts`
- Modify: `packages/core/src/index.ts`

**Step 1: Write failing tests** for no `@McpServer`, duplicate tool/resource/prompt names, duplicate names across the same MCP namespace where relevant, and a valid normalized definition.

**Step 2: Verify red** with `npm test -- --run packages/core/test/definition-reader.test.ts`.

**Step 3: Implement `readServerDefinition()` and a public `TypeMcpDefinitionError`.** Error messages identify the class and conflicting public name but do not expose application secrets.

**Step 4: Verify green** with the focused test command.

**Step 5: Commit.**

```bash
git add packages/core/src packages/core/test/definition-reader.test.ts
git commit -m "feat(core): validate decorated server definitions"
```

## Task 6: Add instance resolver contract

**Objective:** Establish the NestJS-compatible construction seam while retaining direct construction as the default.

**Files:**
- Create: `packages/core/src/resolver/instance-resolver.ts`
- Create: `packages/core/src/resolver/default-instance-resolver.ts`
- Create: `packages/core/test/instance-resolver.test.ts`
- Modify: `packages/core/src/index.ts`

**Step 1: Write failing tests** for default construction and a custom resolver receiving the exact decorated constructor and returning its supplied instance.

**Step 2: Verify red** with `npm test -- --run packages/core/test/instance-resolver.test.ts`.

**Step 3: Implement `InstanceResolver` and the direct-construction default.** The contract returns a value or Promise, enabling a later Nest adapter.

**Step 4: Verify green** with the focused test command.

**Step 5: Commit.**

```bash
git add packages/core/src packages/core/test/instance-resolver.test.ts
git commit -m "feat(core): add pluggable instance resolver"
```

## Task 7: Compile tools into the official MCP SDK

**Objective:** Register decorated tools with runtime validation and safe invocation behavior.

**Files:**
- Create: `packages/core/src/compiler/create-mcp-server.ts`
- Create: `packages/core/src/compiler/normalize-tool-result.ts`
- Create: `packages/core/test/tool-compilation.test.ts`
- Modify: `packages/core/src/index.ts`

**Step 1: Write failing integration tests** using an in-memory MCP client/transport for `tools/list`, valid `tools/call`, async handler return, Zod-invalid arguments, and a thrown handler error.

**Step 2: Verify red** with `npm test -- --run packages/core/test/tool-compilation.test.ts`.

**Step 3: Implement tool registration through `McpServer.registerTool()`.** Validate raw arguments with Zod and call the decorated instance method with the validated value.

**Step 4: Normalize plain strings, MCP content results, and JSON-compatible object results into SDK-compatible content.** Convert expected validation failures and unexpected exceptions to safe MCP-visible errors without stack traces.

**Step 5: Verify green** with the focused test command, then run all core tests.

```bash
npm test -- --run packages/core/test
```

**Step 6: Commit.**

```bash
git add packages/core/src packages/core/test/tool-compilation.test.ts
git commit -m "feat(core): compile decorated tools to MCP"
```

## Task 8: Compile static resources and prompts

**Objective:** Complete the initial declarative MCP surface using the same metadata/compiler model.

**Files:**
- Create: `packages/core/test/resource-prompt-compilation.test.ts`
- Modify: `packages/core/src/compiler/create-mcp-server.ts`
- Modify: `packages/core/src/compiler/normalize-tool-result.ts`

**Step 1: Write failing integration tests** for `resources/list`, `resources/read` on a static URI, `prompts/list`, and `prompts/get` for sync and async prompt handlers.

**Step 2: Verify red** with `npm test -- --run packages/core/test/resource-prompt-compilation.test.ts`.

**Step 3: Register static resources and prompts using the official SDK APIs.** Restrict resources to one explicit URI in this release; do not add URI-template resolution.

**Step 4: Verify green** using the focused test command, then run all core tests.

**Step 5: Commit.**

```bash
git add packages/core/src packages/core/test/resource-prompt-compilation.test.ts
git commit -m "feat(core): compile resources and prompts"
```

## Task 9: Add stdio transport helper

**Objective:** Provide a supported local process entry point without exposing transport setup to consumers.

**Files:**
- Create: `packages/core/src/transports/stdio.ts`
- Create: `packages/core/test/stdio.test.ts`
- Modify: `packages/core/src/index.ts`

**Step 1: Write a failing unit test** with a fake transport factory that confirms the compiled server is connected once.

**Step 2: Verify red** with `npm test -- --run packages/core/test/stdio.test.ts`.

**Step 3: Implement `startStdioServer()` with SDK `StdioServerTransport` as the default and an injected transport factory only for tests.

**Step 4: Verify green** with the focused test command.

**Step 5: Commit.**

```bash
git add packages/core/src packages/core/test/stdio.test.ts
git commit -m "feat(core): add stdio server helper"
```

## Task 10: Implement Fetch Streamable HTTP adapter

**Objective:** Adapt a compiled server factory to a framework-neutral Web Standard handler.

**Files:**
- Create: `packages/http/src/create-mcp-handler.ts`
- Create: `packages/http/src/types.ts`
- Modify: `packages/http/src/index.ts`
- Create: `packages/http/test/create-mcp-handler.test.ts`

**Step 1: Write failing integration tests** that issue Fetch `Request` instances for initialization, `tools/list`, `tools/call`, and unsupported HTTP methods. Exercise at least one valid tool invocation end-to-end.

**Step 2: Verify red** with `npm test -- --run packages/http/test/create-mcp-handler.test.ts`.

**Step 3: Implement `createMcpHandler()` using `WebStandardStreamableHTTPServerTransport`.** Create/retain transport session state in the mechanism prescribed by the MCP SDK; do not invent an independent session protocol.

**Step 4: Verify green** with the focused test command and all HTTP tests.

**Step 5: Commit.**

```bash
git add packages/http/src packages/http/test/create-mcp-handler.test.ts
git commit -m "feat(http): add streamable HTTP handler"
```

## Task 11: Document runnable examples and package APIs

**Objective:** Ensure documented developer flows are executable and explicitly distinguish implemented from deferred NestJS support.

**Files:**
- Create: `examples/standalone-http/package.json`
- Create: `examples/standalone-http/src/server.ts`
- Create: `examples/standalone-http/src/index.ts`
- Create: `examples/nextjs/README.md`
- Modify: `README.md`
- Modify: `docs/api/decorator-api.md`
- Create: `docs/guides/http-and-nextjs.md`
- Create: `docs/guides/nestjs-integration-roadmap.md`

**Step 1: Write an example smoke test** or command-driven assertion that loads the standalone example and verifies its decorated server can list/call a sample tool.

**Step 2: Verify red** with the selected example test command.

**Step 3: Implement minimal examples and revise documentation.** Make the Next.js example clear that it is an integration snippet where full app scaffolding is out of scope.

**Step 4: Verify green** and run the Markdown link validation.

**Step 5: Commit.**

```bash
git add README.md docs/ examples/
git commit -m "docs: add usage guides and examples"
```

## Task 12: Final verification, review, private repository publication

**Objective:** Prove the complete repository meets its documented acceptance criteria, publish it privately, and verify the exact remote state.

**Files:**
- Modify only when review finds a verified defect.

**Step 1: Run the complete local gate.**

```bash
npm ci
npm run typecheck
npm test
npm run build
git diff --check
git status --short
```

Expected: all commands exit 0; only intentional, committed source files are tracked; working tree is clean.

**Step 2: Review the exact diff/history** against the acceptance matrix. Add any missing regression test before correcting a confirmed defect.

**Step 3: Create the private GitHub repository and push.**

```bash
gh repo create sjungwon03/type-mcp \
  --private \
  --source . \
  --remote origin \
  --push \
  --description "Decorator-first TypeScript framework for Model Context Protocol servers"
```

**Step 4: Verify remote identity and head commit.**

```bash
LOCAL_SHA=$(git rev-parse HEAD)
REMOTE_SHA=$(git ls-remote origin refs/heads/main | cut -f1)
test "$LOCAL_SHA" = "$REMOTE_SHA"
gh repo view sjungwon03/type-mcp --json nameWithOwner,url,visibility,defaultBranchRef
git status --short --branch
```

Expected: visibility is `PRIVATE`, default branch is `main`, remote SHA equals local `HEAD`, and the working tree is clean.

**Step 5: Report only verified command results, repository URL, package scope, intentionally deferred features, and the next recommended issue (`@type-mcp/nestjs` implementation).**

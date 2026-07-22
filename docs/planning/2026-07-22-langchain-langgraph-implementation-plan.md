# LangChain adapter and LangGraph composition implementation plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Add a tools-only `type-mcp/langchain` adapter that converts decorated TypeMCP tools to LangChain structured tools, proves direct LangGraph `ToolNode` composition, and replaces current-facing NestJS-adapter commitments.

**Architecture:** Keep the root core and `type-mcp/http` independent of LangChain, LangGraph, and NestJS. Add a `src/langchain.ts` subpath entry that uses the existing metadata reader and `InstanceResolver` to create LangChain `DynamicStructuredTool` instances. LangGraph remains a consumer composition concern: the project verifies `new ToolNode(tools)` in memory but does not introduce a graph wrapper.

**Tech Stack:** TypeScript 5.8 strict mode, Zod 4, `@langchain/core@1.2.3`, `@langchain/langgraph@1.4.8` (development-only integration test), Vitest, tsup, Biome.

**Design:** `docs/superpowers/specs/2026-07-22-langchain-langgraph-integration-design.md`
**Issue:** [#39](https://github.com/Theorvane/type-mcp/issues/39)

---

## Guardrails

- Do not add NestJS, LangChain, or LangGraph imports to `src/index.ts`, `src/http.ts`, or existing MCP compiler modules.
- Publish one unscoped package only. The new public surface is the `type-mcp/langchain` export map subpath—not a workspace and not `@type-mcp/langchain`.
- `@langchain/core` is an optional peer dependency and an exact development dependency for building/testing the adapter. `@langchain/langgraph` is a development-only dependency for the smoke test; it is not imported by adapter source and is not a package peer.
- The first adapter release supports decorated `@McpTool` methods only. Resources, prompts, MCP transport startup, LLM calls, StateGraph construction, persistence, authorization, and agent policy are explicitly out of scope.
- The adapter returns fixed safe failure text, `Tool execution failed`, for thrown handlers and JSON-serialization failures. Never expose an error message, stack, source path, or arbitrary object inspection output.
- Resolve a server once per `createLangChainTools()` call. No global container or discovery behavior.

## Public API contract

```ts
import { createLangChainTools } from "type-mcp/langchain";

const tools = await createLangChainTools(CatalogServer);
const resolvedTools = await createLangChainTools(InjectedServer, {
  resolver: { resolve: () => new InjectedServer(service) },
});
```

The adapter exports:

```ts
export interface CreateLangChainToolsOptions<T extends object> {
  readonly resolver?: InstanceResolver<T> | undefined;
}

export async function createLangChainTools<T extends object>(
  serverClass: ZeroArgumentMcpServerConstructor<T>,
): Promise<readonly DynamicStructuredTool[]>;

export async function createLangChainTools<
  T extends object,
  Arguments extends readonly unknown[],
>(
  serverClass: McpServerConstructor<T, Arguments>,
  options: CreateLangChainToolsOptions<T>,
): Promise<readonly DynamicStructuredTool[]>;
```

| A/E/X case | Required result |
| --- | --- |
| A: decorated tool has name, description, and Zod object input | One `DynamicStructuredTool` preserves the name, description, and schema; `invoke()` calls the decorated method. |
| A: zero-argument class | Adapter creates exactly one instance through the default resolver. |
| A: dependency-requiring class and supplied resolver | Adapter calls the resolver exactly once and invokes methods on the returned instance. |
| E: LangChain tool receives invalid input | Its Zod schema rejects before method invocation; call counter remains zero. |
| E: no server definition or duplicate tool name | Existing `readMcpServerDefinition()` error is thrown while constructing tools. |
| X: handler throws, rejects, returns a cyclic value, or returns `undefined` | `invoke()` resolves to `Tool execution failed`; serialized result contains no raw error/secret. |
| A: method returns a string | `invoke()` returns exactly that string. |
| A: method returns JSON-compatible non-string value | `invoke()` returns `JSON.stringify(value)` with no MCP envelope. |
| A: returned tool list passed to `new ToolNode(tools)` | In-memory ToolNode execution invokes the generated tool; no model, API key, listener, state store, or network service is needed. |

## Task 1: Establish LangChain packaging and subpath export contracts

**Objective:** Make the adapter's dependency and distributable artifact boundary testable before implementing adapter behavior.

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `tsup.config.ts`
- Modify: `scripts/verify-package-exports.mjs`
- Modify: `test/single-package-contract.test.ts`
- Create: `test/langchain-package-contract.test.ts`

**Step 1: Write failing package contract tests**

Add tests that assert:

```ts
expect(manifest.exports?.["./langchain"]).toEqual({
  types: "./dist/langchain.d.ts",
  import: "./dist/langchain.js",
  require: "./dist/langchain.cjs",
});
expect(manifest.peerDependencies?.["@langchain/core"]).toBe("^1.2.3");
expect(manifest.peerDependenciesMeta?.["@langchain/core"]?.optional).toBe(true);
expect(manifest.dependencies?.["@langchain/core"]).toBeUndefined();
expect(manifest.dependencies?.["@langchain/langgraph"]).toBeUndefined();
```

Add a package-artifact test expectation that `type-mcp/langchain` has ESM, CJS, and type declaration artifacts and exposes `createLangChainTools` at runtime after the implementation entry exists.

**Step 2: Verify RED**

Run:

```bash
npm test -- --run test/langchain-package-contract.test.ts
```

Expected: failure because the `./langchain` export and peer contract do not exist.

**Step 3: Add minimal packaging configuration**

- Add exact development dependencies: `@langchain/core@1.2.3` and `@langchain/langgraph@1.4.8`.
- Add `peerDependencies["@langchain/core"]: "^1.2.3"` and optional peer metadata.
- Add `langchain: "src/langchain.ts"` to `tsup.config.ts` entries.
- Add `./langchain` export map to `package.json`.
- Extend `scripts/verify-package-exports.mjs` with the `./langchain` entry and `createLangChainTools` runtime/type symbol expectation.

Do **not** create production adapter behavior in this task; its absent source entry should keep the artifact test red until Task 2.

**Step 4: Verify packaging syntax**

Run:

```bash
npm install --package-lock-only
npm run typecheck
```

Expected: lockfile updates cleanly; typecheck still passes because no adapter entry is compiled yet only if tsup is not run.

**Step 5: Commit**

```bash
git add package.json package-lock.json tsup.config.ts scripts/verify-package-exports.mjs test/single-package-contract.test.ts test/langchain-package-contract.test.ts
git commit -m "chore(langchain): define adapter package boundary"
```

## Task 2: Add metadata-to-LangChain tool adapter with safe invocation

**Objective:** Implement the narrow tools-only adapter using existing metadata and resolver contracts.

**Files:**
- Create: `src/langchain.ts`
- Create: `src/langchain/create-langchain-tools.ts`
- Create: `test/langchain-tools.test.ts`
- Modify: `test/langchain-package-contract.test.ts`

**Step 1: Write failing behavior tests**

In `test/langchain-tools.test.ts`, manually apply `McpTool` and `McpServer` decorators using the existing test helper style. Add isolated tests for:

1. tool name/description/schema projection and string invocation;
2. a custom resolver that produces a dependency-requiring instance once;
3. Zod rejection before a method call counter increments;
4. JSON-compatible object return serializes to text;
5. thrown/rejected handler and cyclic/undefined return map to `Tool execution failed` with no secret text;
6. absent definition and duplicate tool names preserve existing definition-reader failures.

Use a real `DynamicStructuredTool` from the adapter, not a mocked tool wrapper.

**Step 2: Verify RED**

Run:

```bash
npm test -- --run test/langchain-tools.test.ts
```

Expected: module-resolution failure for `../src/langchain.js` because the adapter entry is absent.

**Step 3: Implement the public entry and adapter**

`src/langchain.ts` exports only the adapter function and its options type:

```ts
export {
  createLangChainTools,
  type CreateLangChainToolsOptions,
} from "./langchain/create-langchain-tools.js";
```

`src/langchain/create-langchain-tools.ts` must:

1. call `readMcpServerDefinition(serverClass)` before resolving the instance;
2. resolve through `resolveMcpServerInstance()` using the supplied resolver or the zero-argument default path;
3. map each metadata tool to a `DynamicStructuredTool` using `name`, optional `description`, and `schema: tool.input`;
4. invoke methods with `Reflect.get` and `Reflect.apply` so the instance is preserved;
5. await results and return strings unchanged; use `JSON.stringify` for every other value;
6. treat `undefined`, `JSON.stringify(...) === undefined`, stringify failures, missing/non-callable methods, and handler rejections as `Tool execution failed`;
7. never import `@langchain/langgraph`, MCP transport modules, or NestJS.

Use overloads matching `createMcpServer()` so a dependency-requiring constructor is only accepted when options contain a resolver.

**Step 4: Verify GREEN**

Run:

```bash
npm test -- --run test/langchain-tools.test.ts
npm run typecheck
npm run build
npm run verify:package
```

Expected: adapter behavior tests pass; tsup emits `dist/langchain.{js,cjs,d.ts,d.cts}` and package verification reports all three subpaths.

**Step 5: Commit**

```bash
git add src/langchain.ts src/langchain/create-langchain-tools.ts test/langchain-tools.test.ts test/langchain-package-contract.test.ts package.json package-lock.json tsup.config.ts scripts/verify-package-exports.mjs
git commit -m "feat(langchain): convert MCP tools to structured tools"
```

## Task 3: Prove LangGraph ToolNode interoperability

**Objective:** Verify generated LangChain tools execute through a consumer-owned LangGraph ToolNode without adding a TypeMCP graph abstraction.

**Files:**
- Create: `test/langgraph-tool-node.test.ts`
- Create: `examples/langgraph-tools/README.md`
- Create: `examples/langgraph-tools/src/catalog-tools.ts`

**Step 1: Write the failing ToolNode smoke test**

Create a decorated tool with a simple object input. Call `createLangChainTools()`, construct `new ToolNode(tools)`, and invoke it using an `AIMessage` containing a tool call. Assert the produced tool message content corresponds to the decorated handler result.

The test may use `@langchain/core/messages` and `@langchain/langgraph/prebuilt`, but must not instantiate a model, call a remote API, start a server, or use persistence.

**Step 2: Verify RED**

Run:

```bash
npm test -- --run test/langgraph-tool-node.test.ts
```

Expected: failure until Task 2's adapter artifacts/API are present; if Task 2 is implemented first, create this test before adding any LangGraph-specific example files and verify an initial import/shape failure instead.

**Step 3: Add the smallest consumer example**

Add an example that contains only:

```ts
const tools = await createLangChainTools(CatalogTools);
const toolNode = new ToolNode(tools);
```

Its README must say graph topology, models, authorization, persistence, and deployment belong to the consumer. It must not claim TypeMCP provides a graph runtime.

**Step 4: Verify GREEN**

Run:

```bash
npm test -- --run test/langgraph-tool-node.test.ts
npm test -- --run test/langchain-tools.test.ts test/langgraph-tool-node.test.ts
```

Expected: both suites pass in memory without credentials or network calls.

**Step 5: Commit**

```bash
git add test/langgraph-tool-node.test.ts examples/langgraph-tools
git commit -m "test(langgraph): verify ToolNode interoperability"
```

## Task 4: Update current-facing contracts and retire NestJS direction

**Objective:** Make current documentation describe the new supported extension path accurately while keeping historical records historical.

**Files:**
- Create: `docs/architecture/adr/0002-langchain-langgraph-integration.md`
- Modify: `README.md`
- Modify: `AGENTS.md`
- Modify: `CONTRIBUTING.md`
- Modify: `docs/product/vision.md`
- Modify: `docs/product/mvp-scope.md`
- Modify: `docs/api/decorator-api.md`
- Modify: `docs/architecture/overview.md`
- Modify: `docs/guides/agent-integration.md`
- Modify: `docs/guides/getting-started.md`
- Modify: `docs/README.md`
- Modify: `docs/architecture/adr/0001-framework-neutral-core.md`
- Create: `docs/guides/langchain-langgraph.md`
- Create: `test/langchain-documentation-contract.test.ts`

**Step 1: Write failing documentation contract test**

Create a test that reads the current-facing docs above and asserts:

- `type-mcp/langchain` and LangGraph `ToolNode` are documented as the extension path;
- docs state the adapter is tools-only;
- docs do not present a future NestJS adapter, `ModuleRef`, or provider discovery as supported/planned;
- historical docs (the existing design spec and superseded plan) are excluded from this current-facing assertion;
- the LangChain guide labels `@langchain/core` peer installation and consumer-owned graph policies.

**Step 2: Verify RED**

Run:

```bash
npm test -- --run test/langchain-documentation-contract.test.ts
```

Expected: failure because current documentation still promises NestJS integration and no LangChain guide exists.

**Step 3: Apply the documentation migration**

- Add ADR 0002 and mark ADR 0001 as superseded; preserve ADR 0001's historical text instead of silently rewriting it.
- Update current docs to describe `InstanceResolver` as an explicit construction seam without naming NestJS.
- Replace NestJS roadmap references in public documentation with the LangChain adapter and LangGraph ToolNode guide.
- Update current README release boundary accurately: do not claim the adapter exists in published `0.1.0` until a release actually contains it. State repository-development availability and the planned release boundary clearly.
- Link the new guide from `README.md` and `docs/README.md`.

**Step 4: Verify GREEN**

Run:

```bash
npm test -- --run test/langchain-documentation-contract.test.ts
node scripts/verify-package-exports.mjs
```

Expected: documentation contract and package exports pass.

**Step 5: Commit**

```bash
git add README.md AGENTS.md CONTRIBUTING.md docs test/langchain-documentation-contract.test.ts
git commit -m "docs: replace NestJS roadmap with LangChain integration"
```

## Task 5: Full clean-consumer and regression verification

**Objective:** Prove the final package keeps root/HTTP independent and the adapter works from packed output with peer dependencies.

**Files:**
- Modify: `scripts/verify-publish-readiness.mjs` only if its tarball workflow cannot install/test the new adapter subpath.
- Modify: `test/publish-contract.test.ts` only if a test is needed to assert the final consumer workflow.

**Step 1: Add a failing packed-consumer assertion if existing tarball verification lacks `./langchain` coverage**

The test must pack the project, install it in a clean temporary consumer with `@langchain/core`, dynamically import `type-mcp/langchain`, and assert `createLangChainTools` is a function. It must not install LangGraph unless testing the separate smoke path.

**Step 2: Verify RED**

Run the targeted publish/consumer test and observe it fail before adding adapter export coverage.

**Step 3: Implement only the missing verification wiring**

Reuse the existing package verifier; do not write a second packaging implementation.

**Step 4: Run final verification**

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm run verify:package
npm run verify:publish
npm audit --omit=dev --audit-level=high
git diff --check
git status --short --branch
```

Expected: all applicable checks pass; audit has no high-severity vulnerability. Record any lower-severity, unrelated findings without using `npm audit fix --force` unless separately approved.

**Step 5: Commit**

```bash
git add scripts/verify-publish-readiness.mjs test/publish-contract.test.ts
git commit -m "test(package): verify LangChain adapter consumer"
```

## Delivery sequence

1. Complete this plan as a documentation PR and merge it first.
2. Update Issue #39 with the merged plan link and implementation acceptance cases.
3. Create `feat/39-langchain-tools` from current `origin/main`.
4. Execute Tasks 1–5 as one tightly scoped feature PR only if the diff remains tools-only; otherwise split documentation migration into a dependent issue/PR.
5. Request independent specification and code-quality review on the final implementation head, wait for CI, squash merge, verify Issue #39 closes, then read back `origin/main`.

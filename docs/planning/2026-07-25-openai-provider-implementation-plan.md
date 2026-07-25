# OpenAI-compatible provider implementation plan

> **For Hermes:** Execute this plan task-by-task with test-first evidence.

**Goal:** Add a real OpenAI Responses API adapter at `@theorvane/type-mcp/openai` without adding LLM dependencies or model policy to the TypeMCP core.

**Architecture:** The adapter is a small Fetch-based subpath. It reads an API key from `OPENAI_API_KEY` unless a caller explicitly supplies a key, forms a `POST /responses` request, validates the JSON response as `unknown`, and projects text output through a strict typed result. It uses a caller-injected `fetch` only as a host/test seam; the default is the Node 20 global Fetch implementation. It never discovers models, starts a transport, or runs an agent loop.

**Reference:** OpenCode (`anomalyco/opencode`) is architectural reference only: it separates provider loading, provider-specific model selection, input transforms, and safe error handling. No OpenCode source is copied.

**Tech stack:** TypeScript 5.8 strict mode, Node 20 Fetch, Vitest, tsup, Biome.

**Related issue:** [#91](https://github.com/Theorvane/type-mcp/issues/91)

---

## Contract

```ts
import { createOpenAiResponsesProvider } from "@theorvane/type-mcp/openai";

const provider = createOpenAiResponsesProvider();
const result = await provider.generate({
  model: "gpt-4.1-mini",
  input: "Summarize this product catalog.",
});

if (result.ok) {
  console.log(result.text);
}
```

| A/E/X case | Required behavior |
| --- | --- |
| A | A non-empty `model` and `input` form `POST {baseUrl}/responses` with the bearer credential and JSON body. |
| A | A valid Responses payload with one or more `output_text` content parts returns concatenated text. |
| E | Missing/blank API key, malformed base URL, blank model, or blank input returns a configuration failure before Fetch runs. |
| E | Network rejection, abort, non-2xx response, invalid JSON, or missing text output returns a fixed safe request/response failure without raw provider content. |
| X | The adapter must not include an API key, response body, or provider error message in a returned error. |
| X | The root core, HTTP subpath, and LangChain subpath must not import the OpenAI adapter. |

## Task 1: Define package and public-contract tests

**Files:**
- Create: `test/openai-package-contract.test.ts`
- Create: `test/openai-provider.test.ts`
- Modify: `package.json`, `tsup.config.ts`, `scripts/verify-package-exports.mjs`

1. Add a package test that expects a `./openai` ESM/CJS/types export and no new core dependency.
2. Add behavior tests importing the as-yet absent `src/openai.ts`; cover request projection, environment-key fallback, custom base URL, and safe failures.
3. Run `npm test -- --run test/openai-package-contract.test.ts test/openai-provider.test.ts` and record the expected module-resolution failure.
4. Add only the export-map/build configuration required for the future entry; leave the behavior test red until Task 2.

## Task 2: Implement the Fetch-based Responses adapter

**Files:**
- Create: `src/openai.ts`
- Create: `src/openai/create-openai-responses-provider.ts`

1. Implement public options, request, discriminated result, error code, and provider interface without `any` or unsafe external-data casts.
2. Validate all option/request strings before calling Fetch.
3. Invoke Fetch once with `Authorization: Bearer <key>`, `Content-Type: application/json`, and a Response API body.
4. Parse response JSON as `unknown` and use type guards to extract only `output_text` strings.
5. Convert every expected failure to a fixed safe `OpenAiProviderFailure`; never expose provider body/error text or credentials.
6. Run the focused suite, then typecheck/build/package verification.

## Task 3: Document and prove the public boundary

**Files:**
- Create: `docs/architecture/adr/0003-openai-compatible-provider-adapter.md`
- Create: `docs/api/openai-provider.md`
- Create: `docs/guides/openai-provider.md`
- Create: `examples/openai-provider/README.md`
- Modify: `README.md`, `docs/README.md`, `docs/product/mvp-scope.md`, `docs/architecture/overview.md`, `docs/guides/configuration.md`

1. State that the subpath is an opt-in real provider client, not a TypeMCP core capability or an agent runtime.
2. Document `OPENAI_API_KEY`, key precedence, compatible base URLs, and safe-error behavior.
3. Document no streaming, retry, tool loop, model registry, or provider discovery in this release.
4. Extend documentation contract tests as needed.

## Task 4: Complete release-quality verification

Run from a clean worktree:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run verify:package
git diff --check
git status --short --branch
```

Review the exact staged diff with `.agents/checklists/pre-commit.md`, commit with a conventional message, push `feat/91-openai-provider`, and open a PR against `dev` with `Closes #91`.

# Single-package migration record

**Status:** Superseded package-layout history. The current public package is [`@theorvane/type-mcp`](https://www.npmjs.com/package/@theorvane/type-mcp); see the [npm release guide](../guides/npm-release.md) for the active release contract.

## Historical goal

Issue #14 replaced the original `@type-mcp/core` and `@type-mcp/http` workspaces with one root package. That intermediate unscoped package was later removed from npm. The package is now published from the Theorvane npm organization as `@theorvane/type-mcp`, with `@theorvane/type-mcp/http` and `@theorvane/type-mcp/langchain` export-map subpaths.

## Historical migration steps

1. Add a root/HTTP ESM, CommonJS, and declaration artifact contract.
2. Move core source, tests, and type tests into root `src/`, `test/`, and `type-tests/`; place HTTP in `src/http.ts`.
3. Make the root manifest public, remove workspace manifests, and expose root and `./http` export-map entries.
4. Configure root tsup, TypeScript, Vitest, package-export, and tarball verification.
5. Preserve prior design specifications as historical records rather than current implementation contracts.

## Current acceptance boundary

- `npm pack --dry-run` contains root, HTTP, and LangChain ESM/CJS/type artifacts in one `@theorvane/type-mcp` tarball.
- No workspace/package boundary remains under `packages/core` or `packages/http`.
- Current-facing documentation installs/imports only `@theorvane/type-mcp` and its documented subpaths.
- Release uses the protected `dev` → `main` path, GitHub OIDC Trusted Publishing, provenance, an annotated tag, and a GitHub Release bound to the exact `main` SHA.
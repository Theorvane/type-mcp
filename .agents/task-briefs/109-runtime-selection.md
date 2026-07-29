# Issue #109 — TypeMCP runtime selection guide

## Recovery identity

- Repository: `Theorvane/type-mcp`
- Base: `origin/dev` at `a4d9bcbd458bdcc40e7d9a4b3ab7904bb125b767`
- Branch: `docs/109-runtime-selection`
- Issue: https://github.com/Theorvane/type-mcp/issues/109

## Scope

Add a canonical developer guide that routes readers to the correct released TypeMCP `0.2.2` package boundary. Update existing canonical documentation navigation only. No package or runtime behavior changes.

## Acceptance checks

- Document only published root, stdio, HTTP, and tools-only LangChain exports.
- Preserve application-owned hosting, authorization, model, LangGraph, state, persistence, and deployment responsibilities.
- Verify Markdown links and run repository checks required for docs-only changes.

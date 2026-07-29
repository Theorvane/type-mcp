# Issue #115 — Reference-first TypeMCP usage guides

## Scope

Add canonical, English, release-accurate docs for TypeMCP’s published `@theorvane/type-mcp@0.2.2` surface. The content is reference-first and uses one Petstore catalog scenario to connect declaration inspection, compilation, stdio, Fetch/Streamable HTTP, and tools-only LangChain reuse.

## Required boundaries

- TypeMCP provides decorators, validation, MCP SDK compilation, explicit resolver support, stdio, Streamable HTTP, and tools-only LangChain adaptation.
- Applications own dependencies, hosting, authorization, sessions/persistence policy, models, credentials, LangGraph topology, and deployment.
- Do not add or document unimplemented APIs, OAuth, persistence, legacy SSE, or a LangGraph runtime.

## TDD evidence

- RED: `npm test -- --run test/reference-documentation-contract.test.ts` failed with `ENOENT` for the intentionally absent `docs/guides/core-concepts.md` before the guide was authored.
- GREEN: `npm test -- --run test/reference-documentation-contract.test.ts test/langchain-documentation-contract.test.ts test/standalone-http-example.test.ts test/langgraph-tool-node.test.ts` passed: 4 test files, 4 tests.

## Handoff

The website portal may pin these source documents only after this issue completes independent review, merge to `dev`, and a reviewed promotion to canonical `main`.
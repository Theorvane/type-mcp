# ADR 0004: Expose a narrow invocation context

- **Status:** Accepted
- **Date:** 2026-08-27
- **Issue:** [#180](https://github.com/Theorvane/type-mcp/issues/180)

## Context

FastMCP Context makes request cancellation and progress available to application handlers. MCP TypeScript SDK v2 already supplies a request-scoped ServerContext with identifiers, an AbortSignal, request metadata, and related notification dispatch. Passing the SDK object directly would expose unstable and policy-heavy capabilities such as logging, sampling, elicitation, authentication, and raw protocol sends.

## Decision

TypeMCP will expose its own immutable McpInvocationContext containing only requestId, optional sessionId, signal, and reportProgress. The compiler creates one context per SDK callback and passes it as the final handler argument.

reportProgress is a no-op when the request did not include a progress token. When a token exists, it sends a related MCP progress notification through the SDK callback context. TypeMCP does not invent cancellation: handlers observe the SDK's original AbortSignal.

## Consequences

- Existing JavaScript handlers remain compatible because extra arguments are ignored.
- TypeScript handlers can opt into a stable TypeMCP context without importing SDK internals.
- JSON-only modern HTTP responses cannot carry mid-call progress; applications that need progress select SSE response mode.
- Logging, sampling, elicitation, roots, auth, lifespan state, and raw protocol access remain outside this contract.

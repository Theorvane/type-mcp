# ADR 0002: Use Fetch-first Streamable HTTP transport

- **Status:** Accepted
- **Date:** 2026-07-21

## Context

TypeScript users need an HTTP adapter that works with Next.js route handlers and other runtimes that expose Web Standard `Request` and `Response` objects. The MCP SDK provides a Web Standard Streamable HTTP server transport. Implementing custom JSON-RPC parsing, session rules, or a legacy SSE abstraction would duplicate protocol-sensitive behavior.

## Decision

The `@theorvane/type-mcp/http` subpath will expose a Fetch-style handler:

```ts
type McpHandler = (request: Request) => Promise<Response>;
```

It will delegate protocol/session behavior to the official MCP SDK's Web Standard Streamable HTTP transport. The adapter will support the HTTP methods required by that transport and return a valid method error for unsupported methods.

## Consequences

### Positive

- Works directly with Next.js Route Handlers and standards-oriented runtimes.
- Keeps protocol implementation in the maintained official SDK.
- Avoids framework-specific request/response adapters in the core package.

### Trade-offs

- Node HTTP/Express consumers need a small Fetch bridge or a later dedicated adapter.
- Transport behavior and version compatibility must track the MCP SDK closely.

## Rejected alternatives

- **Next.js-only handler:** prevents use in other Fetch-compatible runtimes.
- **Custom protocol handler:** risks session and JSON-RPC incompatibility.
- **Legacy SSE as initial default:** expands surface area without serving the current transport direction.

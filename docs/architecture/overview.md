# Architecture overview

**Status:** Planned MVP architecture.

## Package boundaries

```text
application class
  │ decorators write definitions
  ▼
@type-mcp/core
  ├─ metadata reader + validation
  ├─ InstanceResolver
  ├─ compiler → official MCP SDK McpServer
  └─ stdio helper
        │
        ├─ MCP stdio transport
        └─ @type-mcp/http → Web Standard Streamable HTTP transport
```

`@type-mcp/core` is the only owner of decorator definitions and compilation. `@type-mcp/http` consumes a compiled-server factory and owns Web Standard request/response adaptation. Applications own business handlers and dependencies.

## Runtime flow

1. `@McpServer`, `@McpTool`, `@McpResource`, and `@McpPrompt` record immutable definition data associated with a class.
2. `createMcpServer()` reads and validates that data before opening a transport.
3. An `InstanceResolver` returns the application class instance. The default resolver constructs it directly.
4. The compiler registers validated tools, static resources, and prompts against the official SDK `McpServer`.
5. A transport connects to the SDK server. For HTTP, `@type-mcp/http` uses the SDK's Web Standard Streamable HTTP transport.
6. Tool inputs cross the Zod validation boundary before application code runs. Errors are converted to safe MCP errors.

## Core contracts

```ts
export interface InstanceResolver {
  resolve<T>(serverClass: new (...args: never[]) => T): T | Promise<T>;
}
```

This interface intentionally permits asynchronous resolution so a future NestJS adapter can obtain providers from `ModuleRef` without changing core metadata or compiler APIs.

## Error boundary

| Failure source | Behavior |
| --- | --- |
| Decorator/definition conflict | fail fast during server compilation with a typed framework error |
| Invalid tool input | return a safe MCP-visible validation error; do not invoke the handler |
| Application handler throws | return generic safe MCP error; log/observability integration is deferred |
| Unsupported HTTP method | return an HTTP method error compatible with the adapter contract |
| Transport/session behavior | delegate to the official SDK transport rather than reimplement protocol state |

## Deferred NestJS adapter

A later `@type-mcp/nestjs` package may discover `@McpServer` providers with Nest `DiscoveryService` and resolve instances with `ModuleRef`. It must depend on `@type-mcp/core`; core must not depend on it. See [ADR 0001](adr/0001-framework-neutral-core.md).

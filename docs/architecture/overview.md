# Architecture overview

**Status:** Target MVP architecture — except decorator metadata storage, the runtime compiler, resolver, stdio helper, and HTTP adapter described here are not implemented yet.

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

`@type-mcp/core` is the only owner of decorator definitions and will own compilation. `@type-mcp/http` will consume a compiled-server factory and own Web Standard request/response adaptation. Today, only decorator metadata storage is implemented; applications own business handlers and dependencies.

## Target runtime flow

The following is planned behavior, not the current runtime implementation:

1. `@McpServer`, `@McpTool`, `@McpResource`, and `@McpPrompt` record definition data associated with a class. This metadata step is implemented.
2. `createMcpServer()` will read and validate that data before opening a transport.
3. An `InstanceResolver` will return the application class instance; the default resolver will construct it directly.
4. The compiler will register validated tools, static resources, and prompts against the official SDK `McpServer`.
5. A transport will connect to the SDK server. For HTTP, `@type-mcp/http` will use the SDK's Web Standard Streamable HTTP transport.
6. Tool inputs will cross the Zod validation boundary before application code runs, and errors will become safe MCP errors.

## Core contracts

```ts
export interface InstanceResolver {
  resolve<T>(serverClass: new (...args: never[]) => T): T | Promise<T>;
}
```

This interface intentionally permits asynchronous resolution so a future NestJS adapter can obtain providers from `ModuleRef` without changing core metadata or compiler APIs.

## Target error boundary

The following error behavior is planned for compiler and HTTP work; it is not provided by the current metadata-only implementation.

| Failure source | Target behavior |
| --- | --- |
| Decorator/definition conflict | fail fast during server compilation with a typed framework error |
| Invalid tool input | return a safe MCP-visible validation error; do not invoke the handler |
| Application handler throws | return generic safe MCP error; log/observability integration is deferred |
| Unsupported HTTP method | return an HTTP method error compatible with the adapter contract |
| Transport/session behavior | delegate to the official SDK transport rather than reimplement protocol state |

## Deferred NestJS adapter

A later `@type-mcp/nestjs` package may discover `@McpServer` providers with Nest `DiscoveryService` and resolve instances with `ModuleRef`. It must depend on `@type-mcp/core`; core must not depend on it. See [ADR 0001](adr/0001-framework-neutral-core.md).

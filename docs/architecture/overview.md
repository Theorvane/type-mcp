# Architecture overview

**Status:** Target MVP architecture — decorator metadata storage, definition validation, and the async-capable resolver seam are implemented. The runtime compiler, stdio helper, and HTTP adapter described here are not implemented yet.

## Package surface

```text
application class
  │ decorators write definitions
  ▼
type-mcp
  ├─ metadata reader + validation
  ├─ InstanceResolver
  ├─ compiler → official MCP SDK McpServer
  ├─ stdio helper
  └─ type-mcp/http → Web Standard Streamable HTTP transport
```

The root `type-mcp` export owns decorator definitions, definition validation, and the resolver seam, and will own compilation. The `type-mcp/http` subpath will consume compiled-server contracts and own Web Standard request/response adaptation. Today, decorator metadata storage, declaration validation, and resolver contracts are implemented; applications own business handlers and dependencies.

## Target runtime flow

The following is planned behavior, not the current runtime implementation:

1. `@McpServer`, `@McpTool`, `@McpResource`, and `@McpPrompt` record definition data associated with a class. This metadata step is implemented.
2. `readMcpServerDefinition()` validates decorated declarations and returns a frozen definition copy. This declaration-validation step is implemented.
3. `resolveMcpServerInstance()` uses the synchronous `defaultInstanceResolver` for zero-argument server classes or awaits a supplied `InstanceResolver<T>`. This resolver seam is implemented.
4. `createMcpServer()` will consume the validated definition and resolved instance before opening a transport.
5. The compiler will register validated tools, static resources, and prompts against the official SDK `McpServer`.
6. A transport will connect to the SDK server. For HTTP, the `type-mcp/http` subpath will use the SDK's Web Standard Streamable HTTP transport.
7. Tool inputs will cross the Zod validation boundary before application code runs, and errors will become safe MCP errors.

## Core contracts

```ts
export interface InstanceResolver<T> {
  resolve<Arguments extends readonly unknown[]>(
    serverClass: new (...args: Arguments) => T,
  ): T | Promise<T>;
}
```

This interface intentionally permits asynchronous resolution so a future NestJS integration can obtain providers from `ModuleRef` without changing root metadata or compiler APIs.

## Target error boundary

The following error behavior is planned for compiler and HTTP work; it is not provided by the current metadata-only implementation.

| Failure source | Target behavior |
| --- | --- |
| Decorator/definition conflict | fail fast during server compilation with a typed framework error |
| Invalid tool input | return a safe MCP-visible validation error; do not invoke the handler |
| Application handler throws | return generic safe MCP error; log/observability integration is deferred |
| Unsupported HTTP method | return an HTTP method error compatible with the adapter contract |
| Transport/session behavior | delegate to the official SDK transport rather than reimplement protocol state |

## Deferred NestJS integration

A later NestJS integration may discover `@McpServer` providers with Nest `DiscoveryService` and resolve instances with `ModuleRef`. It must integrate with `type-mcp` through `InstanceResolver`; the root package must not depend on NestJS. See [ADR 0001](adr/0001-framework-neutral-core.md).

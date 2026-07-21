# Architecture overview

**Status:** Target MVP architecture — decorator metadata storage, definition validation, the async-capable resolver seam, and compilation of tools, static resources, and prompts are implemented. The stdio helper and HTTP adapter described here remain unimplemented.

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

The root `type-mcp` export owns decorator definitions, definition validation, the resolver seam, and MCP SDK compilation for tools, static resources, and prompts. The `type-mcp/http` subpath will consume compiled-server contracts and own Web Standard request/response adaptation. Applications own business handlers and dependencies; transports remain pending.

## Runtime flow

The following distinguishes implemented compiler behavior from planned transport work:

1. `@McpServer`, `@McpTool`, `@McpResource`, and `@McpPrompt` record definition data associated with a class. This metadata step is implemented.
2. `readMcpServerDefinition()` validates decorated declarations and returns a frozen definition copy. This declaration-validation step is implemented.
3. `resolveMcpServerInstance()` uses the synchronous `defaultInstanceResolver` for zero-argument server classes or awaits a supplied `InstanceResolver<T>`. This resolver seam is implemented.
4. `createMcpServer()` consumes the validated definition and resolved instance, then registers validated tools, static resources, and prompts with the official SDK `McpServer`. This compiler path is implemented.
5. Tool inputs cross the Zod validation boundary before application code runs. Compiler handler failures become generic safe content without application error text or stacks.
6. A transport will connect to the SDK server. For HTTP, the `type-mcp/http` subpath will use the SDK's Web Standard Streamable HTTP transport.
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

The following error behavior is implemented for compiler work; HTTP behavior remains planned.

| Failure source | Target behavior |
| --- | --- |
| Decorator/definition conflict | fail fast during server compilation with a typed framework error |
| Invalid tool input | return a safe MCP-visible validation error; do not invoke the handler |
| Application handler throws | return generic safe MCP error; log/observability integration is deferred |
| Unsupported HTTP method | return an HTTP method error compatible with the adapter contract |
| Transport/session behavior | delegate to the official SDK transport rather than reimplement protocol state |

## Deferred NestJS integration

A later NestJS integration may discover `@McpServer` providers with Nest `DiscoveryService` and resolve instances with `ModuleRef`. It must integrate with `type-mcp` through `InstanceResolver`; the root package must not depend on NestJS. See [ADR 0001](adr/0001-framework-neutral-core.md).

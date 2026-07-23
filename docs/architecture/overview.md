# Architecture overview

> **Release note:** The published [`type-mcp@0.2.0`](https://www.npmjs.com/package/type-mcp) release contains the metadata, validation, resolver, compiler, stdio, HTTP, and LangChain adapter surfaces described here. Applications remain responsible for hosting and lifecycle policy.

**Status:** Published architecture — decorator metadata storage, definition validation, the async-capable resolver seam, runtime compiler, Node stdio helper, Fetch Streamable HTTP adapter, and tools-only LangChain adapter are available in `0.2.0`.

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
  ├─ type-mcp/http → Web Standard Streamable HTTP transport
  └─ type-mcp/langchain → LangChain structured tools
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

This interface intentionally permits asynchronous resolution without binding the core to an application container. The LangChain adapter reuses it for explicit construction; it does not perform provider discovery or graph lifecycle management.

## Target error boundary

The following error behavior is planned for compiler and HTTP work; it is not provided by the current metadata-only implementation.

| Failure source | Target behavior |
| --- | --- |
| Decorator/definition conflict | fail fast during server compilation with a typed framework error |
| Invalid tool input | return a safe MCP-visible validation error; do not invoke the handler |
| Application handler throws | return generic safe MCP error; log/observability integration is deferred |
| Unsupported HTTP method | return an HTTP method error compatible with the adapter contract |
| Transport/session behavior | delegate to the official SDK transport rather than reimplement protocol state |

## LangChain and LangGraph boundary

The `type-mcp/langchain` subpath converts decorated tools into LangChain structured tools while retaining TypeMCP's validation, explicit resolver, and safe error boundary. Consumers may pass a copied tool list to LangGraph `ToolNode`, but graph topology, models, authorization, state, persistence, and deployment remain outside TypeMCP. See [ADR 0002](adr/0002-langchain-langgraph-integration.md) and the [integration guide](../guides/langchain-langgraph.md).

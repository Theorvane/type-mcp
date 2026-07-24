# Architecture overview

> **Public release:** [`@theorvane/type-mcp@0.2.0`](https://www.npmjs.com/package/@theorvane/type-mcp) implements the metadata, validation, resolver, compiler, stdio, HTTP, and LangChain adapter surfaces described here. Applications remain responsible for hosting and lifecycle policy.

## Package surface

```text
application class
  │ decorators write definitions
  ▼
@theorvane/type-mcp
  ├─ metadata reader + definition validation
  ├─ InstanceResolver
  ├─ compiler → official MCP SDK McpServer
  ├─ Node stdio helper
  ├─ @theorvane/type-mcp/http → Web Standard Streamable HTTP transport
  └─ @theorvane/type-mcp/langchain → LangChain structured tools
```

The root `@theorvane/type-mcp` export owns decorator definitions, definition validation, explicit instance resolution, MCP SDK compilation, and the Node stdio helper. The `@theorvane/type-mcp/http` subpath adapts Web Standard requests and responses to Streamable HTTP. The `@theorvane/type-mcp/langchain` subpath converts decorated tools to LangChain structured tools without taking ownership of an agent or graph runtime.

## Runtime flow

1. `@McpServer`, `@McpTool`, `@McpResource`, and `@McpPrompt` record immutable definition data associated with a class.
2. `readMcpServerDefinition()` validates decorated declarations and returns a frozen definition copy.
3. `resolveMcpServerInstance()` uses the synchronous `defaultInstanceResolver` for zero-argument server classes or awaits a supplied `InstanceResolver<T>`.
4. `createMcpServer()` validates the definition, resolves an instance, and compiles tools, static resources, and prompts against the official MCP SDK `McpServer`.
5. Tool inputs cross the Zod validation boundary before application code runs. The runtime returns safe tool results instead of exposing application errors.
6. The application chooses a transport boundary: use the root stdio helper for a Node process, or use `@theorvane/type-mcp/http` for the SDK Streamable HTTP transport.

## Core contracts

```ts
export interface InstanceResolver<T> {
  resolve<Arguments extends readonly unknown[]>(
    serverClass: new (...args: Arguments) => T,
  ): T | Promise<T>;
}
```

This interface intentionally permits asynchronous resolution without binding the core to an application container. Applications own construction policy and dependencies. The LangChain adapter reuses the same explicit resolver seam; it does not perform provider discovery or graph lifecycle management.

## Error and transport boundary

| Failure source | Runtime behavior | Owner |
| --- | --- | --- |
| Decorator/definition conflict | fail fast with a typed TypeMCP definition error before server compilation | TypeMCP |
| Invalid tool input | return a safe MCP-visible validation result without invoking the handler | TypeMCP |
| Application handler failure | return the package's safe result boundary without leaking application errors | TypeMCP; application owns logging/observability policy |
| Unsupported HTTP method | return the adapter's HTTP method result | TypeMCP HTTP adapter |
| Transport/session protocol state | delegate MCP framing and Streamable HTTP sessions to the official SDK | TypeMCP + SDK |
| Authentication, authorization, persistence, deployment, durable session policy | explicit host integration decisions | Application |

## LangChain and LangGraph boundary

The `@theorvane/type-mcp/langchain` subpath converts decorated tools into LangChain structured tools while retaining TypeMCP's validation, explicit resolver, and safe invocation boundary. Consumers may pass a copied tool list to LangGraph `ToolNode`, but graph topology, models, authorization, state, persistence, and deployment remain outside TypeMCP. See [ADR 0002](adr/0002-langchain-langgraph-integration.md) and the [integration guide](../guides/langchain-langgraph.md).

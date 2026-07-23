# ADR 0001: Keep the core framework-neutral through an instance resolver

- **Status:** Superseded by [ADR 0002](0002-langchain-langgraph-integration.md)
- **Date:** 2026-07-21

## Context

The desired developer experience is decorator-first while remaining useful in applications with different construction and dependency-management conventions. Directly importing an application framework in the package would couple every TypeScript consumer to that framework's container, reflection conventions, and lifecycle semantics. Conversely, always constructing a decorated class with `new` would make dependency-aware application integration impossible.

## Decision

`type-mcp` stores class/method definitions and exposes an async-capable `InstanceResolver` interface. The default resolver directly constructs the decorated class. The compiler depends only on the interface.

**Implementation status:** `InstanceResolver<T>`, `defaultInstanceResolver`, and `resolveMcpServerInstance()` are implemented. Direct construction is type-restricted to zero-argument server classes; a custom resolver supports dependency-requiring constructors. MCP SDK compilation consumes this seam.

```ts
export interface InstanceResolver<T> {
  resolve<Arguments extends readonly unknown[]>(
    serverClass: new (...args: Arguments) => T,
  ): T | Promise<T>;
}
```

Consumers can implement this interface with their own construction mechanism without coupling TypeMCP to a particular container or discovery API.

## Consequences

### Positive

- Core stays usable by plain TypeScript, Node, Next.js, and other runtimes.
- Dependency-aware construction can be added without rewriting decorator metadata or compilation APIs.
- Resolver behavior is easy to unit test.

### Trade-offs

- The API exposes one small extension point before all users need it.
- Request-specific construction needs an explicit consumer design; it is not implied by the default resolver.

## Rejected alternatives

- **Make an application framework a core peer dependency:** excludes other consumers and ties release cadence to an external framework.
- **Support direct construction only:** blocks injected services and application-owned construction.
- **Use a global service locator:** hides lifecycle behavior and weakens tests/type contracts.

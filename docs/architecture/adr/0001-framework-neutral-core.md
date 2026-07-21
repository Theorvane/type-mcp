# ADR 0001: Keep the core framework-neutral through an instance resolver

- **Status:** Accepted
- **Date:** 2026-07-21

## Context

The desired developer experience is decorator-first and needs to fit NestJS in the future. Directly importing NestJS in the first package would couple all TypeScript consumers to Nest modules, reflection/discovery conventions, and Nest lifecycle semantics. Conversely, always constructing a decorated class with `new` would make DI integration impossible.

## Decision

`type-mcp` stores class/method definitions and exposes an async-capable `InstanceResolver` interface. The default resolver directly constructs the decorated class. The compiler will depend only on the interface.

**Implementation status:** `InstanceResolver<T>`, `defaultInstanceResolver`, and `resolveMcpServerInstance()` are implemented. Direct construction is type-restricted to zero-argument server classes; a custom resolver supports dependency-requiring constructors. MCP SDK compilation has not yet been connected to this seam.

```ts
export interface InstanceResolver<T> {
  resolve<Arguments extends readonly unknown[]>(
    serverClass: new (...args: Arguments) => T,
  ): T | Promise<T>;
}
```

A future NestJS integration will implement this interface with Nest `ModuleRef` and may use `DiscoveryService` to find decorated providers.

## Consequences

### Positive

- Core stays usable by plain TypeScript, Node, Next.js, and other runtimes.
- NestJS lifecycle/DI can be added without rewriting decorator metadata or compilation APIs.
- Resolver behavior is easy to unit test.

### Trade-offs

- The initial API exposes one small extension point before all users need it.
- Per-request Nest provider scope needs an adapter-specific design; it is not implied by the default resolver.

## Rejected alternatives

- **Make NestJS a core peer dependency:** excludes non-Nest consumers and ties release cadence to Nest.
- **Support direct construction only:** blocks injected services and Nest provider discovery.
- **Use a global service locator:** hides lifecycle behavior and weakens tests/type contracts.

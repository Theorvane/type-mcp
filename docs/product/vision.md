# Product vision

**Status:** Product target. The current implementation provides decorator metadata storage, definition validation, and an async-capable instance-resolver seam; compiler, runtime tool-input validation, stdio, and HTTP outcomes below remain planned MVP work.

## Problem

Teams building MCP servers in TypeScript often assemble protocol registration, runtime validation, HTTP transport, and framework integration by hand. The resulting code is repetitive, hard to discover in large applications, and becomes tightly coupled to a chosen framework too early.

## Product statement

`type-mcp` lets TypeScript teams declare MCP servers, tools, resources, and prompts on familiar classes, then compiles those declarations to the official MCP SDK. It prioritizes a small framework-neutral core today and a clean NestJS DI integration path tomorrow.

## Primary users

1. **TypeScript platform/backend developers** adding MCP endpoints to existing services.
2. **NestJS teams** that want decorators now without forcing all adopters to install NestJS.
3. **Next.js/Web Standard developers** that need a protocol-correct Streamable HTTP entry point.

## MVP user outcomes

- A developer can define a small MCP server class without manually calling low-level SDK registration APIs.
- Tool inputs are validated at runtime and rejected safely when invalid.
- A developer can expose a compiled server via stdio or a Fetch-compatible Streamable HTTP handler.
- Future NestJS integration can resolve decorated providers without rewriting core server classes.

## Success criteria

| Criterion | Evidence |
| --- | --- |
| Declarative clarity | A runnable example defines and invokes a tool with a decorated class. |
| Protocol correctness | Integration tests exercise initialize, list, and call paths through the official SDK transports. |
| Safe boundaries | Tests prove invalid inputs and thrown handlers do not expose stack traces. |
| Framework neutrality | `type-mcp` has no NestJS dependency/import and supports a custom resolver. |
| Developer confidence | Strict typecheck, tests, builds, and CI pass from a clean install. |

## Product principles

- **The MCP SDK remains authoritative.** `type-mcp` is an ergonomic layer, not an alternate protocol implementation.
- **Metadata is declarative; execution is explicit.** Decorators record definitions; compilation and transport wiring happen deliberately.
- **A small core beats premature platform lock-in.** NestJS support is an adapter concern.
- **Safe errors are part of the API.** Developer ergonomics must not leak application internals to MCP clients.

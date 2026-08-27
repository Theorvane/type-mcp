# ADR 0003: Use explicit schemas for dynamic declarations

- **Status:** Accepted
- **Date:** 2026-08-27
- **Issue:** [#178](https://github.com/Theorvane/type-mcp/issues/178)

## Context

FastMCP exposes typed prompt arguments, URI-template resources, and argument completion. TypeMCP cannot safely infer runtime schemas from erased TypeScript parameter types, and its public contract requires runtime validation of external values. MCP TypeScript SDK v2 already supplies high-level prompt schemas, resource templates, and completion dispatch.

## Decision

TypeMCP will add optional explicit Zod object schemas to prompts and templated resources. A URI containing RFC 6570 variables is a template and must declare a matching input schema. Static resources remain zero-argument handlers.

Prompt completion attaches to explicitly completable schema fields. Resource completion is declared per URI variable. Both paths delegate protocol dispatch and the 100-value response bound to SDK v2 while wrapping application callbacks in TypeMCP's safe error boundary.

The decorated handler receives one parsed argument object. TypeScript parameter reflection, implicit schema generation, and string-to-domain coercion outside the supplied Zod schema remain excluded.

## Consequences

- External prompt arguments and URI variables cross a Zod validation boundary before application code runs.
- Existing zero-argument prompts and static resources remain source-compatible.
- Definition validation can reject template/schema mismatches before SDK registration.
- Applications explicitly choose coercion, defaults, descriptions, and completion behavior.
- Decorator metadata retains caller-supplied executable schema and callback identity; only surrounding metadata containers are copied and frozen.

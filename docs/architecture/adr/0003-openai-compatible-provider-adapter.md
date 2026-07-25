# ADR 0003: Isolate an OpenAI-compatible Responses client in a package subpath

- **Status:** Accepted
- **Date:** 2026-07-25
- **Related issue:** [#91](https://github.com/Theorvane/type-mcp/issues/91)

## Context

TypeMCP provides MCP declaration, compilation, transport, and a tools-only LangChain boundary. Consumers sometimes need a direct model call next to these integrations, but putting provider selection or SDK dependencies in the root runtime would make MCP server users install and configure an unrelated LLM client.

OpenCode's provider implementation demonstrates useful separation: provider loading, model selection, request transformation, and provider-error handling are distinct concerns. Its complete multi-provider registry is far broader than TypeMCP's immediate need.

## Decision

Publish a small `@theorvane/type-mcp/openai` subpath that uses standard Fetch to call the OpenAI Responses API. It has no SDK dependency and is not imported by the root, HTTP, or LangChain surfaces.

The first contract supports one non-streaming text-generation operation. It defaults to `OPENAI_API_KEY`, permits an explicit API key and an OpenAI-compatible base URL, validates response JSON before projection, and emits only fixed typed failures. The host may inject Fetch for controlled runtimes and tests.

## Consequences

### Positive

- Consumers can make a real provider request without coupling TypeMCP core to a provider SDK.
- Node 20 Fetch keeps the adapter small and makes network behavior testable without credentials.
- A strict response boundary prevents raw error bodies and credential values from becoming application-visible results.

### Trade-offs

- The first adapter is intentionally not a generic provider registry.
- Streaming, retry/backoff, model discovery, tool execution loops, and provider-specific transforms stay consumer-owned or require later scoped decisions.
- Compatible endpoints must implement the OpenAI Responses request/response subset documented by this adapter.

## Rejected alternatives

- **Put the client in the root package:** forces an LLM concern and configuration onto all MCP users.
- **Copy OpenCode's provider registry:** imports unnecessary abstractions, provider integrations, and policy for a single-provider initial contract.
- **Use raw provider errors verbatim:** risks exposing API details, secrets, and inconsistent public behavior.

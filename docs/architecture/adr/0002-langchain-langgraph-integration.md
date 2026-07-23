# ADR 0002: Use LangChain tools and LangGraph composition as the agent integration boundary

- **Status:** Accepted
- **Date:** 2026-07-22
- **Supersedes:** [ADR 0001](0001-framework-neutral-core.md) for current integration direction

## Context

TypeMCP needs an integration path for agent applications without adding a framework container, graph runtime, or model policy to the MCP core. A framework-specific container adapter would require lifecycle, discovery, and request-scope commitments that are unrelated to the tool interoperability users need.

## Decision

Keep `type-mcp` framework-neutral and expose a tools-only `type-mcp/langchain` subpath. It reads existing decorated tool metadata, resolves a server through the existing explicit `InstanceResolver`, and returns LangChain structured tools.

LangGraph remains consumer-owned composition. Consumers pass a mutable copy of these tools to `ToolNode` and retain ownership of graph topology, models, authorization, persistence, and deployment. The adapter does not import LangGraph.

`@langchain/core` is an optional peer dependency of the adapter. `@langchain/langgraph` is not a package dependency or peer; it is an application choice and repository test/example dependency only.

## Consequences

### Positive

- Core, MCP transports, and agent orchestration remain separate.
- Decorated tool schemas and explicit resolver behavior are reused rather than duplicated.
- LangGraph interoperability is proved without TypeMCP owning graph state or model behavior.

### Trade-offs

- Consumers using the adapter must install the LangChain peer.
- Consumers must copy the readonly tool list before passing it to APIs that require a mutable array.
- Resources and prompts are not converted in this first adapter boundary.

## Rejected alternatives

- **Framework-specific container adapter:** introduces lifecycle and provider-discovery commitments without meeting agent interoperability needs.
- **A TypeMCP graph runtime:** duplicates LangGraph routing, persistence, and policy APIs.
- **A separate scoped workspace package:** conflicts with the current one unscoped-package policy before the adapter API is proven.

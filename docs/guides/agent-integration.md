# Agent integration guide

This guide gives coding agents a deterministic procedure for adding TypeMCP declarations without inventing application-owned policy. It applies to the published `@theorvane/type-mcp@0.2.0` package.

## Capability contract agents must honor

An agent may use `@McpServer`, `@McpTool`, `@McpResource`, `@McpPrompt`, `getMcpServerDefinition()`, `readMcpServerDefinition()`, `createMcpServer()`, and the explicit `InstanceResolver` seam. The published `@theorvane/type-mcp/http` and `@theorvane/type-mcp/langchain` subpaths provide the HTTP and tools-only LangChain boundaries.

An agent must not claim automatic application-container discovery, OAuth, authorization policy, session persistence, hosting, model selection, LangGraph topology, or a provider integration. TypeMCP's published runtime validates and compiles declarations, but applications own those policies and lifecycle decisions.

## Evidence-first workflow

1. Read the installed package version with `npm view @theorvane/type-mcp@latest version` or inspect the lockfile. Never infer availability from an issue, branch, or documentation that describes future work.
2. Inspect the installed package exports using `node --input-type=module -e "import('@theorvane/type-mcp').then((m) => console.log(Object.keys(m)))"` before proposing an API not shown in the README.
3. Read the [README capability map](../../README.md#capability-map), [configuration guide](configuration.md), and this guide before editing code.
4. Add `@theorvane/type-mcp` and `zod` as application dependencies if they are absent. Confirm Node 20+ and standard TypeScript decorator support.
5. Define a class with `@McpServer` and method decorators. Use a Zod object schema for every `@McpTool`.
6. Add a focused test that calls `getMcpServerDefinition(TheClass)` and asserts the public declaration names.
7. Run the application's typecheck and focused test. State whether it stops at metadata inspection or uses a published runtime adapter, and name the application-owned policy boundary.
8. Open a separate scoped issue before adding OAuth, persistence, authorization, provider integration, graph lifecycle, or application-container discovery.

## Minimal agent-safe patch shape

A small declaration-only change normally contains these pieces:

```ts
import { z } from "zod";
import {
  getMcpServerDefinition,
  McpServer,
  McpTool,
} from "@theorvane/type-mcp";

const searchInput = z.object({ query: z.string().min(1) });

@McpServer({ name: "search", version: "0.2.0" })
export class SearchServer {
  @McpTool({ description: "Describe the search contract.", input: searchInput })
  search({ query }: z.infer<typeof searchInput>) {
    return { query };
  }
}

export const searchDefinition = getMcpServerDefinition(SearchServer);
```

This code records a declaration and reads it. To expose a runnable server, use a compiler or adapter exported by the installed package with an explicit resolver and application-owned host policy. An agent must state that boundary explicitly in a PR summary or handoff.

## Required output for an agent handoff

A reliable handoff names the installed package version, lists the decorated classes and public MCP names, names the Zod schemas, reports focused verification, and identifies any application-owned runtime policy. Do not put secrets or private infrastructure in a public issue; use the repository's contribution guidance for public collaboration.

## When to open a new issue instead

Open a scoped issue before attempting OAuth, authorization, HTTP session handling, dynamic resource templates, prompt argument inference, instance construction through an application container, a new framework adapter, model/provider integration, graph lifecycle, or persistence. Each changes the runtime contract and needs its own tests, API documentation, and architecture decision.

# Agent integration guide

This guide gives coding agents a deterministic procedure for adding TypeMCP declarations without inventing runtime support. It applies to the published [`type-mcp@0.1.0`](https://www.npmjs.com/package/type-mcp) package.

## Capability contract agents must honor

An agent may use `@McpServer`, `@McpTool`, `@McpResource`, `@McpPrompt`, and `getMcpServerDefinition()`. The latter returns a frozen declaration copy or `undefined` for an undecorated class.

An agent must not call or claim working support for `createMcpServer()`, `createMcpHandler()`, stdio helpers, Streamable HTTP transport, automatic tool invocation, runtime MCP input validation, declaration validation, resource/prompt registration, instance resolvers, or automatic application-container discovery. They are not available in the `0.1.0` release. The public [`type-mcp/http` export](../../package.json) is a reserved subpath, not an HTTP server implementation.

## Evidence-first workflow

1. Read the installed package version with `npm view type-mcp@latest version` or inspect the lockfile. Never infer availability from an issue, branch, or documentation that describes future work.
2. Inspect the installed package exports using `node --input-type=module -e "import('type-mcp').then((m) => console.log(Object.keys(m)))"` before proposing an API not shown in the README.
3. Read the [README capability map](../../README.md#capability-map), [configuration guide](configuration.md), and this guide before editing code.
4. Add `type-mcp` and `zod` as application dependencies if they are absent. Confirm Node 20+ and standard TypeScript decorator support.
5. Define a class with `@McpServer` and method decorators. Use a Zod object schema for every `@McpTool`.
6. Add a focused test that calls `getMcpServerDefinition(TheClass)` and asserts the public declaration names.
7. Run the application's typecheck and focused test. State the exact stopping point: metadata declaration and application-owned inspection only.
8. Open a separate scoped issue before adding a compiler, transport, invocation path, or DI adapter.

## Minimal agent-safe patch shape

A small declaration-only change normally contains these pieces:

```ts
import { z } from "zod";
import {
  getMcpServerDefinition,
  McpServer,
  McpTool,
} from "type-mcp";

const searchInput = z.object({ query: z.string().min(1) });

@McpServer({ name: "search", version: "0.1.0" })
export class SearchServer {
  @McpTool({ description: "Describe the search contract.", input: searchInput })
  search({ query }: z.infer<typeof searchInput>) {
    return { query };
  }
}

export const searchDefinition = getMcpServerDefinition(SearchServer);
```

This code records a declaration and reads it. It does not validate duplicate names, create a network listener, expose a tool to an MCP client, invoke `search` through the MCP SDK, or validate an MCP request. An agent must say that distinction explicitly in a PR summary or handoff.

## Required output for an agent handoff

A reliable handoff names the installed package version, lists the decorated classes and public MCP names, names the Zod schemas, reports focused verification, and repeats that the integration stops before compilation and transport. Do not put secrets or private infrastructure in a public issue; use the repository's contribution guidance for public collaboration.

## When to open a new issue instead

Open a scoped issue before attempting SDK registration, tool-result normalization, input validation during tool calls, declaration validation, stdio, HTTP session handling, OAuth, authorization, dynamic resource templates, prompt argument inference, instance construction through an application container, or a new framework adapter. Each changes the runtime contract and needs its own tests, API documentation, and architecture decision.

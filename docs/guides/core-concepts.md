# Core concepts

This page explains the published [`@theorvane/type-mcp@0.2.2`](https://www.npmjs.com/package/@theorvane/type-mcp) model before you choose a runtime boundary.

> **Responsibility boundary:** TypeMCP provides declaration metadata, validation, MCP SDK compilation, and selected adapters. Applications retain ownership of **hosting, authorization, persistence, models, LangGraph composition, and deployment**.

## A declaration is not a deployment

Decorators describe an MCP-facing contract on ordinary application methods:

```ts
import { z } from "zod";
import { McpServer, McpTool } from "@theorvane/type-mcp";

@McpServer({ name: "petstore", version: "1.0.0" })
export class PetstoreServer {
  @McpTool({
    name: "find-product",
    description: "Find a Petstore product by SKU.",
    input: z.object({ sku: z.string().min(1) }),
  })
  findProduct({ sku }: { readonly sku: string }) {
    return { sku, available: true };
  }
}
```

`@McpServer` records server identity. `@McpTool` records a public name, description, and Zod object input schema. Resource and prompt decorators work the same way for their supported static contracts. The decorators do not start a process, open a network listener, select a web framework, read credentials, or authorize a caller.

## Read a definition at an application boundary

Use `getMcpServerDefinition()` when application code needs to inspect the contract before exposing it:

```ts
import { getMcpServerDefinition } from "@theorvane/type-mcp";
import { PetstoreServer } from "./petstore-server.js";

const definition = getMcpServerDefinition(PetstoreServer);
if (definition === undefined) {
  throw new Error("PetstoreServer is missing @McpServer metadata.");
}

console.log(definition.tools.map((tool) => tool.name));
// ["find-product"]
```

The returned definition container, component arrays, and component records are frozen snapshots. A tool's Zod schema retains its original identity because executable schemas cannot safely be cloned or frozen. Treat a schema supplied to a decorator as immutable.

## Compile with an explicit instance resolver

`createMcpServer()` validates the decorated definition, resolves an instance, and produces an official MCP SDK server. The resolver is the boundary where the application can supply a service, repository, or API client:

```ts
import {
  createMcpServer,
  type InstanceResolver,
} from "@theorvane/type-mcp";
import { PetstoreServer } from "./petstore-server.js";

const resolver: InstanceResolver<PetstoreServer> = {
  resolve: () => new PetstoreServer(),
};

const server = await createMcpServer(PetstoreServer, resolver);
```

For a zero-argument class, the default resolver is available. For a dependency-requiring class, supply the explicit `InstanceResolver`; TypeMCP does not discover an application container or construct your dependencies.

## Choose the smallest runtime boundary

| Need | Published entry point | TypeMCP provides | Application provides |
| --- | --- | --- | --- |
| Describe, inspect, or compile a server | `@theorvane/type-mcp` | declarations, validation, resolver seam, MCP SDK compilation | dependencies, method behavior, authorization |
| Communicate with a local MCP client | `@theorvane/type-mcp` | `startStdioServer()` | executable packaging, process lifecycle, environment validation, access control |
| Receive MCP requests through Fetch | `@theorvane/type-mcp/http` | Streamable HTTP framing and in-process session routing | route, origin policy, authentication, durable-session policy, deployment |
| Reuse decorated tools with LangChain | `@theorvane/type-mcp/langchain` | LangChain structured tools | model, agent/graph topology, state, policy, persistence |

Read [Choose a runtime boundary](runtime-selection.md) for complete code at each boundary. The [Petstore walkthrough](petstore-walkthrough.md) uses the same declaration to make the choice concrete.

## What to read next

- [Petstore walkthrough](petstore-walkthrough.md) — declaration, resolver, and three supported paths.
- [Decorator API contract](../api/decorator-api.md) — all public options and exclusions.
- [HTTP framework integration](http-and-nextjs.md) — Fetch/Next.js route shape.
- [LangChain and LangGraph integration](langchain-langgraph.md) — tools-only adapter and consumer-owned graph composition.

# Petstore walkthrough: from declaration to a selected runtime

This walkthrough uses one read-only Petstore catalog tool to show the published [`@theorvane/type-mcp@0.2.2`](https://www.npmjs.com/package/@theorvane/type-mcp) flow: declare a server, inspect or compile it, then select the smallest supported runtime boundary.

> **What this does not do:** TypeMCP does not choose hosting, authorization, persistence, models, LangGraph composition, or deployment. Those decisions remain in the application.

## Before you start

- Node.js 20 or later
- TypeScript with standard decorators; do not enable legacy `experimentalDecorators`
- An application-owned catalog service if the real tool needs data or an API client

Install the package and Zod:

```bash
npm install @theorvane/type-mcp zod
```

Use a Node-aware TypeScript configuration:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022", "ESNext.Decorators", "DOM", "DOM.Iterable"],
    "strict": true,
    "verbatimModuleSyntax": true
  }
}
```

## 1. Declare the Petstore server

Create `src/petstore-server.ts`:

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

The expected public tool name is `find-product`. Zod validates the input when a compiled MCP or LangChain boundary invokes the tool. The class is still ordinary application code: use an application service or client in its constructor when a real catalog lookup needs one.

## 2. Inspect, then compile through an explicit resolver

Create `src/server.ts`:

```ts
import {
  createMcpServer,
  getMcpServerDefinition,
  type InstanceResolver,
} from "@theorvane/type-mcp";
import { PetstoreServer } from "./petstore-server.js";

const definition = getMcpServerDefinition(PetstoreServer);
if (definition === undefined) {
  throw new Error("PetstoreServer is missing its declaration.");
}

const resolver: InstanceResolver<PetstoreServer> = {
  resolve: () => new PetstoreServer(),
};

export const server = await createMcpServer(PetstoreServer, resolver);
```

At this point, TypeMCP has validated the declaration, resolved one application instance, and compiled an MCP SDK server. The application still decides how requests reach that server and what policy applies to each call.

## 3. Select one boundary

### Run locally over stdio

When an MCP-capable desktop or local client launches your process, add `src/stdio.ts`:

```ts
import { startStdioServer } from "@theorvane/type-mcp";
import { server } from "./server.js";

await startStdioServer(server);
```

TypeMCP connects the compiled server to the SDK stdio transport. Your application owns executable packaging, environment validation, process lifecycle, and access control. Continue with [runtime selection](runtime-selection.md#connect-stdio-when-the-process-is-the-boundary).

### Serve Streamable HTTP from a Fetch or Next.js host

Install no extra TypeMCP package; import the published HTTP subpath. Create `src/mcp-handler.ts`:

```ts
import { createMcpServer } from "@theorvane/type-mcp";
import { createMcpHandler } from "@theorvane/type-mcp/http";
import { PetstoreServer } from "./petstore-server.js";

export const handler = createMcpHandler(() =>
  createMcpServer(PetstoreServer, { resolve: () => new PetstoreServer() }),
);
```

A Fetch host can call `handler(request)`. In a Next.js route, re-export it for `GET`, `POST`, and `DELETE`. The adapter owns JSON-RPC framing, protocol negotiation, and in-process MCP session routing. The host owns the URL, authentication, origin controls, durable-session policy, telemetry, and deployment. See [HTTP framework integration](http-and-nextjs.md) and the [executable standalone HTTP example](../../examples/standalone-http/README.md).

### Reuse the tool with LangChain

Install the optional peer only when you select this path:

```bash
npm install @theorvane/type-mcp @langchain/core zod
```

Create `src/langchain-tools.ts`:

```ts
import { createLangChainTools } from "@theorvane/type-mcp/langchain";
import { PetstoreServer } from "./petstore-server.js";

export const tools = await createLangChainTools(PetstoreServer, {
  resolver: { resolve: () => new PetstoreServer() },
});
```

The adapter creates LangChain structured tools from decorated `@McpTool` methods. It does not start an MCP transport, build an agent, choose a model, or create a LangGraph graph. Pass `tools` to your own LangChain or LangGraph composition and retain the policy/state decisions there. See [LangChain and LangGraph integration](langchain-langgraph.md) and the [in-memory ToolNode example](../../examples/langgraph-tools/README.md).

## Verify the pattern

The repository proves the published HTTP and LangChain boundaries without a live listener, model, credential, or public Petstore request:

```bash
npm test -- --run test/standalone-http-example.test.ts
npm test -- --run test/langgraph-tool-node.test.ts
```

These smoke tests exercise the existing catalog example. In your application, add focused tests for the resolver, the tool's domain result, and the authorization policy that TypeMCP deliberately leaves to you.

## Next steps

- [Core concepts](core-concepts.md) — declaration, definition, compiler, and resolver model.
- [Choose a runtime boundary](runtime-selection.md) — decision table for root, stdio, HTTP, and LangChain.
- [Decorator API contract](../api/decorator-api.md) — exact exported API and exclusions.

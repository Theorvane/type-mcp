# Petstore walkthrough: from declaration to a selected runtime

This walkthrough uses one read-only Petstore catalog tool to show the published [`@theorvane/type-mcp@0.4.0`](https://www.npmjs.com/package/@theorvane/type-mcp) flow: declare a server, inspect or compile it, then select the smallest supported runtime boundary.

> **What this does not do:** TypeMCP does not choose hosting, authorization, persistence, models, LangGraph composition, or deployment. Those decisions remain in the application.

## Before you start

- Node.js 20 or later
- TypeScript with standard decorators; do not enable legacy `experimentalDecorators`
- An application-owned catalog service if the real tool needs data or an API client

## Workspace checkpoint

For a project-starting route, complete [Petstore project setup](petstore-project-setup.md) and [Petstore TypeMCP foundation](petstore-typemcp-foundation.md) first. This walkthrough is the continuation that selects one runtime boundary after the declaration, explicit resolver, and local stdio path already compile.

## Install

Install the package and Zod:

```bash
npm install @theorvane/type-mcp@0.4.0 zod
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

The decorated class must keep a zero-argument constructor under the published `0.4.0` `@McpServer` contract. Configure a real catalog service through the explicit resolver before it creates `PetstoreServer`; TypeMCP does not construct or authorize that dependency for you.

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
npm install @theorvane/type-mcp@0.4.0 @langchain/core zod
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

## Run and verify

Choose exactly one continuation and run the matching check from the project root:

```bash
# stdio: compile first, then start the process; it remains attached to stdin/stdout.
npm run check
npm run inspect-server
npm run stdio

# HTTP: create src/mcp-handler.ts as shown above, then compile the consumer project.
npm run check

# LangChain: create src/langchain-tools.ts as shown above, then compile the consumer project.
npm run check
```

`npm run check` is the consumer-project verification: it typechecks each selected source file against the installed published package. For stdio, a successful process stays open for its MCP client rather than printing a completion line; stop it with `Ctrl+C` after the client has connected. HTTP and LangChain compilation does not deploy a listener or call a model.

## Expected behavior

The declaration produces the public `find-product` tool name. The selected stdio path connects an already compiled server to a local process, the HTTP path returns a Fetch-compatible handler, and the LangChain path returns structured tools. None of these choices creates a host, authorizes a caller, selects a model, or persists application state.

## Verify the pattern

**Repository maintainers only:** the following commands require this repository checkout (they are not commands for a copied consumer workspace). They prove the published HTTP and LangChain boundaries without a live listener, model, credential, or public Petstore request:

```bash
npm test -- --run test/standalone-http-example.test.ts
npm test -- --run test/langgraph-tool-node.test.ts
```

These smoke tests exercise the existing catalog example. In your application, add focused tests for the resolver, the tool's domain result, and the authorization policy that TypeMCP deliberately leaves to you.

## Failure guide

- **Decorator or ESM compilation fails:** start with the strict `NodeNext` and `ESNext.Decorators` configuration in [project setup](petstore-project-setup.md); do not enable legacy `experimentalDecorators`.
- **A dependency or credential is unavailable:** construct and validate it in the application composition root before the resolver creates `PetstoreServer`. TypeMCP does not supply credentials or a retry policy.
- **A client needs another process:** use the stdio or HTTP host selected by the application. The LangChain path adapts tools only and is not a client/transport.

## Responsibility boundary

TypeMCP can validate the declaration, compile it through the resolver, and connect a compiled server to a selected published boundary. The application owns its catalog client, authorization, policy, process and host lifecycle, persistence, models, LangGraph composition, telemetry, and deployment.

## Next steps

- [Core concepts](core-concepts.md) — declaration, definition, compiler, and resolver model.
- [Choose a runtime boundary](runtime-selection.md) — decision table for root, stdio, HTTP, and LangChain.
- [Decorator API contract](../api/decorator-api.md) — exact exported API and exclusions.

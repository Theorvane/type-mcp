# Choose a TypeMCP runtime boundary

> **Release status:** This guide documents the published `@theorvane/type-mcp@0.2.2` package. Version `0.2.2` is an audit-remediation release; the runtime boundaries below are the released `0.2.x` surface.

A TypeMCP class is a declaration plus ordinary application methods. Choose the package entry point from the way the application needs to expose that declaration, then keep hosting and policy at the application boundary.

## Start from the smallest surface

Install the root package and Zod when the application declares MCP tools, resources, or prompts:

```bash
npm install @theorvane/type-mcp@0.2.2 zod
```

The root entry point provides decorators, definition inspection, compilation through `createMcpServer()`, an explicit `InstanceResolver`, and `startStdioServer()`. It does not select a web framework, model, authorization scheme, session store, persistence layer, or deployment target.

| Need | Import | Use it when | Keep in the application |
| --- | --- | --- | --- |
| Describe and validate an MCP surface | `@theorvane/type-mcp` | A class declares tools, resources, or prompts and the application needs an MCP SDK server instance. | Dependencies, resolver construction, tool behavior, authorization, and errors. |
| Serve a local MCP process | `@theorvane/type-mcp` | A process communicates with an MCP client through standard input and output. | Process lifecycle, executable packaging, environment validation, and access control. |
| Serve Streamable HTTP | `@theorvane/type-mcp/http` | A Fetch-compatible route should receive MCP HTTP traffic. | Route placement, origin policy, authentication, deployment, and durable session policy. |
| Reuse decorated tools in LangChain | `@theorvane/type-mcp/langchain` | A LangChain application needs structured tools from an existing TypeMCP declaration. | Models, LangGraph topology, state, persistence, authorization, and agent lifecycle. |

## Compile a declared server before choosing transport

The root package is the common starting point for every supported path. `createMcpServer()` validates the decorated definition and resolves one application-owned instance.

```ts
// src/catalog-server.ts
import { z } from "zod";
import {
  createMcpServer,
  McpServer,
  McpTool,
} from "@theorvane/type-mcp";

@McpServer({ name: "catalog", version: "1.0.0" })
export class CatalogServer {
  @McpTool({
    name: "find_product",
    description: "Find a product by SKU.",
    input: z.object({ sku: z.string().min(1) }),
  })
  findProduct({ sku }: { readonly sku: string }) {
    return { sku, available: true };
  }
}

export const server = await createMcpServer(CatalogServer, {
  resolve: () => new CatalogServer(),
});
```

The resolver is intentionally explicit. Replace the constructor call with the application’s dependency-injection seam when the tool needs a database client, domain service, or credentialed API client. TypeMCP validates the declaration and compiles the MCP SDK server; it does not construct application dependencies or decide how a request is authorized.

## Connect stdio when the process is the boundary

Use stdio when the TypeMCP process is launched by an MCP-capable client. The helper connects an already compiled server to the official MCP SDK `StdioServerTransport`.

```ts
// src/stdio.ts
import { startStdioServer } from "@theorvane/type-mcp";
import { server } from "./catalog-server.js";

await startStdioServer(server);
```

The process still needs an application-owned startup contract. Validate environment variables before constructing dependencies, decide who may launch the process, and keep operational logging free of tool inputs or credentials unless the application’s policy permits them.

## Mount Fetch-compatible Streamable HTTP when the host owns the route

The HTTP subpath accepts and returns Web-standard `Request` and `Response` values. Create a handler from a factory so each MCP session receives an appropriately compiled server.

```ts
// src/mcp-handler.ts
import { createMcpServer } from "@theorvane/type-mcp";
import { createMcpHandler } from "@theorvane/type-mcp/http";
import { CatalogServer } from "./catalog-server.js";

export const handler = createMcpHandler(() =>
  createMcpServer(CatalogServer, {
    resolve: () => new CatalogServer(),
  }),
);
```

A Fetch host can then route supported requests to `handler`. For a Next.js route shape, re-export it as the supported HTTP methods:

```ts
export { handler as DELETE, handler as GET, handler as POST } from "../../../src/mcp-handler.js";
```

The adapter handles MCP HTTP session routing, protocol negotiation, and JSON-RPC framing inside the process. The host application owns the URL, authentication, origin controls, deployment, telemetry choices, and any durable session policy. Read [HTTP framework integration](http-and-nextjs.md) before adapting the route to a production host.

## Adapt tools to LangChain without handing over the application

Install the optional LangChain peer only when importing the tools-only adapter:

```bash
npm install @theorvane/type-mcp@0.2.2 @langchain/core zod
```

```ts
import { createLangChainTools } from "@theorvane/type-mcp/langchain";
import { CatalogServer } from "./catalog-server.js";

const tools = await createLangChainTools(CatalogServer, {
  resolver: { resolve: () => new CatalogServer() },
});
```

The adapter turns decorated `@McpTool` methods into LangChain structured tools. It does not start an MCP transport, map resources or prompts, construct an agent, create a LangGraph `ToolNode`, choose a model, or retain state. Pass the returned tools into the application’s own LangChain or LangGraph composition and make policy decisions there. The [LangChain and LangGraph guide](langchain-langgraph.md) shows the supported in-memory `ToolNode` boundary.

## Verify the selected path

Use the smallest relevant guide after choosing a boundary:

- [Petstore project setup](petstore-project-setup.md) creates the strict TypeScript workspace and application-owned client seam.
- [Petstore TypeMCP foundation](petstore-typemcp-foundation.md) verifies declaration inspection, explicit-resolver compilation, and the local stdio boundary.
- [Petstore walkthrough](petstore-walkthrough.md) selects an optional HTTP or LangChain continuation after the foundation path.
- [Getting started](getting-started.md) explains decorator configuration and definition inspection outside the Petstore path.
- [Core concepts](core-concepts.md) explains declarations, validation/compiler behavior, and the explicit resolver seam.
- [HTTP framework integration](http-and-nextjs.md) contains the published Fetch and Next.js route shape.
- [LangChain and LangGraph integration](langchain-langgraph.md) covers structured tools and consumer-owned graph composition.
- [Decorator API contract](../api/decorator-api.md) lists the released declarations, resolver contract, and transport APIs.

The selected entry point should be the smallest surface that reaches the intended boundary. Adding an HTTP host to solve a local stdio integration, or adding a graph runtime to convert structured tools, makes deployment and policy decisions less visible without adding a TypeMCP capability.

# Petstore TypeMCP foundation: declare, inspect, compile, and run stdio

This chapter continues the [Petstore project setup](petstore-project-setup.md). It turns the application-owned Petstore client seam into one decorated MCP server, verifies its definition, compiles it through an explicit resolver, and starts a local stdio process.

## Before you start

- Complete [Petstore project setup](petstore-project-setup.md), including strict NodeNext TypeScript configuration.
- Node.js 20 or later and the released `@theorvane/type-mcp@0.4.0` and `zod` dependencies.
- An MCP-capable local client only if you plan to connect to the stdio process after verifying the project locally.

## Workspace checkpoint

After this chapter, the workspace includes:

```text
petstore-workspace/
└── src/
    ├── inspect-server.ts
    ├── petstore-client.ts
    ├── petstore-server.ts
    ├── server.ts
    └── run-stdio.ts
```

The local script connects a compiled server to stdio. It does not register the program with a desktop client or turn the tutorial’s in-memory catalog into a production service.

## Install

Confirm the project contains the released package and local commands:

```bash
npm install @theorvane/type-mcp@0.4.0 zod
npm install --save-dev typescript tsx @types/node
npm pkg set scripts.check="tsc --noEmit"
npm pkg set scripts.inspect-server="tsx src/inspect-server.ts"
npm pkg set scripts.stdio="tsx src/run-stdio.ts"
```

## Declare the server

Create `src/petstore-server.ts`:

```ts
import { z } from "zod";
import { McpServer, McpTool } from "@theorvane/type-mcp";

import type { PetstoreClient } from "./petstore-client.js";

@McpServer({ name: "petstore", version: "1.0.0" })
export class PetstoreServer {
  @McpTool({
    name: "find-product",
    description: "Find a Petstore product by SKU.",
    input: z.object({ sku: z.string().min(1) }),
  })
  findProduct({ sku }: { readonly sku: string }) {
    if (this.client === undefined) {
      throw new Error("Petstore client was not configured by the application.");
    }

    return this.client.findProduct(sku);
  }

  private client: PetstoreClient | undefined;

  configure(client: PetstoreClient) {
    this.client = client;
    return this;
  }
}
```

The decorated class deliberately has no constructor parameters because that is the published `@McpServer` decorator contract in `0.4.0`. The explicit resolver returns an application-owned configured instance before compilation; replace `configure()` with your own composition-root wiring while preserving a zero-argument decorated constructor.

## Inspect the declaration

Create `src/inspect-server.ts`:

```ts
import { getMcpServerDefinition } from "@theorvane/type-mcp";

import { PetstoreServer } from "./petstore-server.js";

const definition = getMcpServerDefinition(PetstoreServer);
if (definition === undefined) {
  throw new Error("PetstoreServer is missing @McpServer metadata.");
}

console.log({
  server: definition.name,
  tools: definition.tools.map((tool) => tool.name),
});
```

`getMcpServerDefinition()` makes the declaration available for application inspection. It does not instantiate the server or open a transport.

## Compile through the explicit resolver

Create `src/server.ts`:

```ts
import {
  createMcpServer,
  type InstanceResolver,
} from "@theorvane/type-mcp";

import type { PetstoreClient } from "./petstore-client.js";
import { PetstoreServer } from "./petstore-server.js";

export function createPetstoreMcpServer(petstoreClient: PetstoreClient) {
  const resolver: InstanceResolver<PetstoreServer> = {
    resolve: () => new PetstoreServer().configure(petstoreClient),
  };

  return createMcpServer(PetstoreServer, resolver);
}
```

The explicit form `createMcpServer(PetstoreServer, resolver)` validates the decorated definition, resolves an application-owned instance, and compiles the supported surface into an MCP SDK server.

In a larger application, the composition root can make its ownership explicit before calling the factory:

```ts
import type { PetstoreClient } from "./petstore-client.js";

declare const petstoreClient: PetstoreClient;
```

That declaration is a typing seam, not a credential implementation. Construct and authorize the real dependency in your application startup code.

## Run and verify

Create `src/run-stdio.ts`:

```ts
import { startStdioServer } from "@theorvane/type-mcp";

import type { PetstoreClient } from "./petstore-client.js";
import { createPetstoreMcpServer } from "./server.js";

const localPetstoreClient: PetstoreClient = {
  findProduct: async (sku) => ({
    sku,
    name: "Petstore starter product",
    available: true,
  }),
};

const server = await createPetstoreMcpServer(localPetstoreClient);
await startStdioServer(server);
```

Then run:

```bash
npm run check
npm run inspect-server
npm run stdio
```

The last command intentionally remains running while its stdio transport waits for MCP protocol messages. Stop it with `Ctrl+C` after confirming the process starts. Configure an MCP-capable client separately with the executable command your application packages; that client configuration is not created by TypeMCP.

## Expected behavior

- `npm run check` succeeds.
- `npm run inspect-server` prints a value equivalent to:

  ```text
  { server: 'petstore', tools: [ 'find-product' ] }
  ```

- `npm run stdio` starts the application-owned local process without an HTTP listener, browser, model call, or credentials. A connected MCP client can discover the compiled `find-product` tool according to the client’s own configuration.

## Failure guide

- **`PetstoreServer is missing @McpServer metadata`:** confirm the class is decorated and imported from the `.js` ESM path in the inspecting file.
- **A TypeScript error around decorators:** use the NodeNext/`ESNext.Decorators` configuration from [project setup](petstore-project-setup.md); do not enable `experimentalDecorators`.
- **A TypeScript error says the decorated constructor is incompatible:** keep the `@McpServer` class zero-argument and configure application dependencies in the explicit resolver. The published 0.4.0 decorator contract does not accept a constructor-parameter class.
- **The process exits immediately:** inspect application startup errors and the real client/dependency configuration. `startStdioServer()` connects an already compiled server; it does not validate your environment or provision a client.
- **A local MCP client cannot discover the tool:** verify that the client launches the documented executable from the project directory and that its own process/access policy permits it. TypeMCP does not register desktop client configuration.

## Responsibility boundary

TypeMCP validates a declaration, compiles an MCP server, and connects that server to stdio. You own Petstore data access, resolver dependencies, process lifecycle, executable packaging, environment validation, authorization, logging policy, hosting, persistence, models, LangGraph composition, and deployment.

## Next steps

Continue with [Petstore runtime selection](petstore-walkthrough.md) for optional Fetch/Next.js HTTP or tools-only LangChain reuse. Read [runtime selection](runtime-selection.md) for the complete boundary table and [decorator API](../api/decorator-api.md) for the exact public contracts.

# Standalone Streamable HTTP example

This example is a minimal TypeScript server declaration compiled into a Fetch-compatible MCP Streamable HTTP handler. It deliberately does **not** start a Node listener or bind to a web framework: a host framework supplies a Web `Request` and returns the handler's `Response`.

> **Published package example:** `@theorvane/type-mcp@0.2.0` provides `createMcpServer()` and `@theorvane/type-mcp/http`. This example leaves route hosting, durable session policy, and authorization to the application; the adapter owns in-process MCP session routing.

## Build from a checkout

From the repository root:

```bash
npm ci
npm run example:standalone-http
```

The command builds the root package, installs the example's local `file:../..` dependency through its lockfile, and compiles `src/` to `dist/`.

## Handler source

`src/catalog-server.ts` uses standard TypeScript decorators to define one `find-product` tool. `src/server.ts` compiles it through the root package and exports the handler:

```ts
import { createMcpServer } from "@theorvane/type-mcp";
import { createMcpHandler } from "@theorvane/type-mcp/http";

import { CatalogServer } from "./catalog-server.js";

export const handler = createMcpHandler(() => createMcpServer(CatalogServer));
```

Map it to your host framework's route without changing protocol state. For example, a framework that provides standard Fetch requests can call `await handler(request)` directly. The MCP SDK owns JSON-RPC framing, protocol-version negotiation, and Streamable HTTP session behavior.

## Verify behavior

The repository smoke test compiles this exact example, initializes it in memory, lists `find-product`, and calls it through the exported Fetch handler:

```bash
npm test -- --run test/standalone-http-example.test.ts
```

The test creates no network listener and sends no external requests.

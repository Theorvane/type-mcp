# HTTP framework integration

## Repository example

The [standalone Streamable HTTP example](../../examples/standalone-http/README.md) is the smallest runnable repository-source integration. It exports a Fetch handler rather than choosing a web framework.

```bash
npm ci
npm run example:standalone-http
npm test -- --run test/standalone-http-example.test.ts
```

Its handler is built from a decorated class with the root compiler and the `@theorvane/type-mcp/http` subpath:

```ts
import { createMcpServer } from "@theorvane/type-mcp";
import { createMcpHandler } from "@theorvane/type-mcp/http";

export const handler = createMcpHandler(() => createMcpServer(CatalogServer));
```

A host that supports standard Web `Request`/`Response` values can delegate its MCP route to this handler. Keep route authentication, deployment, and observability in the host application. The SDK-managed handler owns Streamable HTTP sessions, MCP protocol negotiation, and JSON-RPC framing.

## Next.js route shape

A Next.js application can re-export the handler for the supported HTTP methods:

```ts
import { handler } from "./server.js";

export { handler as DELETE, handler as GET, handler as POST };
```

This is a route integration shape, not a full Next.js scaffold. It intentionally does not prescribe hosting, authentication, persistence, or a database.

## Published package boundary

The published `@theorvane/type-mcp@0.2.0` package includes `createMcpServer()` and `@theorvane/type-mcp/http`. This guide demonstrates the package API, while hosting, authentication, persistence, and authorization remain application-owned responsibilities.

# MCP TypeScript SDK v2 migration

The current `dev` source uses the split stable MCP TypeScript SDK v2 packages. Runtime code depends on `@modelcontextprotocol/server@2.0.0`; protocol integration tests use `@modelcontextprotocol/client@2.0.0`. The monolithic `@modelcontextprotocol/sdk` v1 package is no longer installed.

## HTTP applications

Existing factory-based HTTP setup remains source-compatible:

```ts
const handler = createMcpHandler(() => createMcpServer(CatalogServer));
```

The adapter classifies requests with the official SDK. Claim-less 2025 requests retain TypeMCP's stateful Streamable HTTP sessions. Requests carrying the 2026-07-28 per-request envelope use the SDK v2 handler. Applications do not need separate routes for the two eras.

The optional `enableJsonResponse` setting still selects JSON or SSE response shaping. In 2026 JSON mode, SDK progress and other mid-call notifications are not streamed; choose SSE when those messages are required.

## stdio applications

Use a factory to enable SDK-owned 2025/2026 negotiation:

```ts
serveStdioServer(() => createMcpServer(CatalogServer));
```

The older instance form remains available:

```ts
await startStdioServer(createMcpServer(CatalogServer));
```

Keep the instance form only when preserving the existing 2025-compatible lifecycle is intentional. A factory is required for modern negotiation because the SDK creates and pins a server instance after determining the protocol era.

## Direct SDK imports

Consumer code that imported v1 SDK types directly must migrate those imports independently:

```ts
import { Client } from "@modelcontextprotocol/client";
import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
```

TypeMCP's own root, HTTP, LangChain, and legacy package subpaths remain unchanged.

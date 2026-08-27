# Testing and media helpers

**Availability:** current `dev` source; not included in published `0.3.2`.

## In-memory protocol tests

Use `@theorvane/type-mcp/testing` to run a compiled server through the official SDK v2 protocol without opening a socket or subprocess.

```ts
import { createMcpServer } from "@theorvane/type-mcp";
import { createMcpTestSession } from "@theorvane/type-mcp/testing";
import { CatalogServer } from "./catalog-server.js";

const session = await createMcpTestSession(
  createMcpServer(CatalogServer),
);

try {
  const tools = await session.client.listTools();
  const result = await session.client.callTool({
    name: "findProduct",
    arguments: { sku: "SKU-1" },
  });
} finally {
  await session.close();
}
```

The helper connects the official `Client` and compiled SDK `McpServer` through `InMemoryTransport`. `close()` is idempotent and closes both sides. If connection setup fails, both sides are cleaned up before the original error is rethrown. Pass `{ client: { name, version } }` to override the test client identity.

This is a protocol-backed integration helper, not a mock. Transport-specific HTTP/stdio behavior still needs transport tests.

## Image and audio results

`McpImage` and `McpAudio` accept bytes and an explicit MIME type. They defensively copy input bytes and optional annotations.

```ts
import { McpAudio, McpImage } from "@theorvane/type-mcp";

return new McpImage(pngBytes, {
  mimeType: "image/png",
  annotations: { audience: ["user"] },
});

return [
  new McpImage(firstPng, { mimeType: "image/png" }),
  "Audio preview",
  new McpAudio(wavBytes, { mimeType: "audio/wav" }),
];
```

Direct helpers and lists containing only helpers and strings become standard MCP image, audio, and text content blocks. `McpImage` rejects non-`image/*` MIME types; `McpAudio` rejects non-`audio/*` types.

The root package intentionally does not read file paths. Consumers that load media from disk, object storage, or the network own that I/O and pass the resulting `Uint8Array`.

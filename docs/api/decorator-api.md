# Decorator API contract

**Published baseline:** [`@theorvane/type-mcp@0.3.2`](https://www.npmjs.com/package/@theorvane/type-mcp) provides decorator declarations, definition validation, MCP SDK compilation for tools/static resources/prompts, a Node stdio helper, and a Fetch Streamable HTTP adapter. The contract below describes current `dev` source, including SDK v2 serving, server identity/instructions, modern component metadata, tool `outputSchema`, explicit prompt arguments, resource URI templates, and completion. LangChain interoperability is isolated at `@theorvane/type-mcp/langchain`.

## Server declaration

```ts
import { McpServer, McpTool, createMcpServer } from "@theorvane/type-mcp";
import { createMcpHandler } from "@theorvane/type-mcp/http";

@McpServer({
  name: "catalog",
  version: "0.2.0",
  title: "Catalog server",
  description: "Catalog lookup and configuration.",
  websiteUrl: "https://example.com/catalog",
  icons: [{ src: "https://example.com/catalog.svg", sizes: ["any"] }],
  instructions: "Use findProduct with a catalog SKU.",
})
class CatalogServer {}
```

| Case | Behavior |
| --- | --- |
| Accept | `name` and `version` identify one decorated server class. Optional `title`, `description`, `websiteUrl`, and `icons` provide standard MCP implementation identity; `instructions` tells connected clients how to use the server. The decorator records an immutable server definition and defensively copies icon metadata. |
| Validate and compile | `createMcpServer()` validates the definition, resolves an instance explicitly, and compiles it into an official MCP SDK `McpServer`. Identity fields are published as `serverInfo`, and `instructions` is published in the initialization result. |
| Excluded | Automatic application-container discovery and inferred application metadata. |

## Tool declaration

```ts
@McpTool({
  name: "find-product",
  title: "Find a product",
  description: "Find a product by SKU.",
  input: z.object({ sku: z.string().min(1) }),
  outputSchema: z.object({ sku: z.string(), available: z.boolean() }),
  annotations: { readOnlyHint: true, openWorldHint: false },
  _meta: { owner: "catalog-team" },
})
findProduct(input: { sku: string }) {
  return { sku: input.sku, available: true };
}
```

| Case | Behavior |
| --- | --- |
| Accept | A method name is used as the tool name unless an explicit `name` is supplied. `input` and optional `outputSchema` values must be Zod object schemas. Optional `title`, `annotations`, and custom `_meta` are forwarded as standard MCP tool metadata. `readMcpServerDefinition()` rejects duplicate tool names. |
| Runtime | The compiler registers the validated tool with the MCP SDK. Zod validates tool input before the decorated handler runs. JSON-compatible object returns become both JSON text content and `structuredContent`; strings, primitives, and arrays remain text-only. Explicit SDK-valid tool results are preserved. When `outputSchema` is present, the SDK validates the normalized structured output; validation and handler failures use safe MCP error results. |
| Excluded | Parameter decorators, automatic schema reflection, authorization, retries, and leaking handler stack traces. |

## Resource declaration

```ts
@McpResource({
  name: "repository",
  uri: "repo://{owner}/{repo}",
  mimeType: "application/json",
  input: z.object({ owner: z.string(), repo: z.string() }),
  complete: {
    repo: (value, context) => lookupRepos(context?.arguments?.owner, value),
  },
})
readRepository(input: { readonly owner: string; readonly repo: string }) {
  return input;
}
```

| Case | Behavior |
| --- | --- |
| Accept | A static URI remains a zero-argument resource. A URI template must declare an explicit Zod `input` whose fields exactly match its variables; `complete` callbacks may target only declared variables. Optional standard metadata is preserved. |
| Runtime | Static resources use the existing SDK registration. Templates appear in `resources/templates/list`; URI variables are Zod-validated before the parsed object reaches the handler. Completion callbacks are isolated from application errors and SDK v2 bounds responses to 100 values. |
| Excluded | Implicit parameter inference, resource subscription policy, and persistence/caching policies. |

## Prompt declaration

```ts
@McpPrompt({
  name: "summarize-product",
  args: z.object({
    sku: McpCompletable(z.string().describe("Product SKU"), completeSku),
  }),
})
summarizeProduct(input: { readonly sku: string }) {
  return "Summarize product " + input.sku + ".";
}
```

| Case | Behavior |
| --- | --- |
| Accept | A named method is recorded with optional metadata and an explicit Zod `args` object. `McpCompletable(schema, callback)` marks individual fields for completion. Zero-argument prompts remain valid. |
| Runtime | SDK v2 derives the MCP prompt argument list, validates request strings through the schema, dispatches completion, and passes the parsed object to the handler. Results and handler failures retain TypeMCP normalization and safe errors. |
| Excluded | Automatic argument inference from TypeScript parameter types and prompt template files. Tool icons and prompt icons/custom metadata remain excluded until the compiler exposes them. |

## Server construction

```ts
import {
  resolveMcpServerInstance,
  type InstanceResolver,
} from "@theorvane/type-mcp";

class CatalogServer {
  constructor(private readonly catalog: object) {}
}

declare const catalogService: object;

const resolver: InstanceResolver<CatalogServer> = {
  resolve: () => new CatalogServer(catalogService),
};

const instance = await resolveMcpServerInstance(CatalogServer, resolver);
```

| Case | Behavior |
| --- | --- |
| Accept | `InstanceResolver<T>` accepts the decorated constructor for `T` and returns `T` or `Promise<T>`. `resolveMcpServerInstance()` uses `defaultInstanceResolver` only for a zero-argument constructor; that direct-construction path is rejected at compile time for classes requiring dependencies. Passing a custom resolver enables dependency-requiring constructors. The default resolver preserves its synchronous return type. |
| Runtime | `createMcpServer()` uses this resolver seam before compiling the decorated definition. |
| Excluded | Built-in application-container resolution, request-scoped semantics, and global service location. |

## stdio adapters

```ts
serveStdioServer(() => createMcpServer(CatalogServer));
```

| Case | Behavior |
| --- | --- |
| Negotiated runtime | `serveStdioServer(factory)` delegates connection ownership and 2025/2026 protocol negotiation to the SDK v2 `serveStdio()` entry point. The factory may use its request context to vary construction by protocol era. |
| Compatibility runtime | `startStdioServer(server)` keeps the instance-based 2025-compatible helper for applications that already own one compiled server and transport. |
| Application-owned | Process startup, environment validation, executable packaging, authorization, and shutdown policy remain in the application. |

## HTTP adapter

```ts
const handler = createMcpHandler(() => createMcpServer(CatalogServer));
export { handler as GET, handler as POST, handler as DELETE };
```

| Case | Behavior |
| --- | --- |
| Runtime | `createMcpHandler()` adapts Web Standard `Request`/`Response` values to SDK v2. It preserves stateful 2025 Streamable HTTP sessions and routes 2026-07-28 envelope requests to the SDK's per-request handler. A zero-argument factory remains valid; factories may optionally inspect the SDK request context. |
| Application-owned | Route registration, authentication, authorization, deployment, observability, and durable session policy remain in the host application. |
| Excluded | OAuth policy, custom durable sessions, Express middleware, and legacy SSE transport. |

## Metadata immutability

`getMcpServerDefinition()` returns a newly allocated, frozen server definition, component arrays, and component records on every read. Tool `input` and `outputSchema` schemas retain the caller-supplied Zod object-schema identity: schemas are executable mutable objects and are not cloned or frozen by TypeMCP. Standard metadata containers, including server and resource icons with nested size arrays, are defensively copied and frozen on definition reads. Consumers should treat a schema supplied to a decorator as immutable after declaration.

## Legacy TypeScript decorators

`@theorvane/type-mcp/legacy` is the compatibility entrypoint for TypeScript's
legacy `experimentalDecorators` emit in CommonJS applications. It is separate
from the root standard-decorator entrypoint; do not combine their decorator
semantics in one compilation unit.
It exposes `McpServer`, `McpTool`, `McpResource`, and `McpPrompt` with the same
options and definition-reader/compiler contracts as the root Stage 3 API.

```ts
import { z } from "zod";
import { McpServer, McpTool } from "@theorvane/type-mcp/legacy";

@McpServer({ name: "catalog", version: "1.0.0" })
class CatalogServer {
  @McpTool({ input: z.object({ sku: z.string() }) })
  findProduct({ sku }: { readonly sku: string }) {
    return { sku };
  }
}
```

Use `"module": "Node16"`, `"moduleResolution": "Node16"`, and
`"experimentalDecorators": true` for a CommonJS consumer so TypeScript selects
the package's CJS declaration condition. In the same compilation, static imports
of `@theorvane/type-mcp/http` and `@theorvane/type-mcp/langchain` also select
their CJS `.d.cts` declarations; install `@langchain/core` when importing the
LangChain adapter. The legacy entrypoint supports public
instance methods with string names only; parameter, accessor, field, private,
and symbol-named decorators are excluded. Do not mix Stage 3 and legacy
decorators in one TypeScript compilation unit.

## Compatibility policy

Public decorator option names, exported definitions, `InstanceResolver`, compiler and transport entry points, and handler signatures are semver-governed. Any breaking change requires an ADR, migration note, and a major release decision.

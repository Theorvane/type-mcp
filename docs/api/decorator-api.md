# Decorator API contract

**Status:** Metadata declarations, definition validation, the resolver seam, and SDK compilation of tools, static resources, and prompts are implemented. stdio and HTTP transport remain planned MVP work.

## Server declaration

```ts
import { McpServer, McpTool } from "type-mcp";
import { createMcpHandler } from "type-mcp/http";

@McpServer({ name: "catalog", version: "0.1.0" })
class CatalogServer {}
```

| Case | Behavior |
| --- | --- |
| Accept | `name` and `version` identify one decorated server class. The decorator records an immutable server definition for later compilation. `readMcpServerDefinition()` rejects an undecorated class with `TypeMcpDefinitionError`. `createMcpServer()` compiles validated tool declarations for this server. |
| Deferred | stdio and HTTP transport remain planned. |
| Excluded | Automatic Nest provider discovery and inferred application metadata. |

## Tool declaration

```ts
@McpTool({
  name: "find-product",
  description: "Find a product by SKU.",
  input: z.object({ sku: z.string().min(1) }),
})
findProduct(input: { sku: string }) {
  return `Found ${input.sku}`;
}
```

| Case | Behavior |
| --- | --- |
| Accept | A method name is used as the tool name unless an explicit `name` is supplied. `input` must be a Zod object schema. `createMcpServer()` registers each validated declaration with the official SDK; SDK validation runs before the bound instance method. String results become text content, JSON-compatible values become JSON text, and valid MCP tool results pass through. Duplicate tool names are rejected by `readMcpServerDefinition()`. |
| Deferred | stdio and transport work remain separate tasks. |
| Excluded | Parameter decorators, automatic schema reflection, authorization, retries, and leaking handler stack traces. |

## Resource declaration

```ts
@McpResource({
  uri: "config://catalog",
  mimeType: "application/json",
})
readConfig() {
  return { region: "ap-northeast-2" };
}
```

| Case | Behavior |
| --- | --- |
| Accept | A static explicit URI and optional MIME type are recorded as one resource declaration. `readMcpServerDefinition()` rejects duplicate resource names. |
| Accept | `createMcpServer()` registers each static URI through the official SDK. A handler may return text, JSON-compatible data, or an SDK-valid read result. Text and JSON-compatible values become one resource content item at the declared URI; the declared MIME type is retained. Handler failures return generic safe content without application exception text or stack traces. |
| Excluded | URI templates, subscription/push resources, and persistence/caching policies. |

## Prompt declaration

```ts
@McpPrompt({
  name: "summarize-product",
  description: "Prepare a product-summary prompt.",
})
summarizeProduct() {
  return "Summarize the catalog.";
}
```

| Case | Behavior |
| --- | --- |
| Accept | A named **zero-argument** method is recorded as a prompt declaration. `readMcpServerDefinition()` rejects duplicate prompt names. Component namespaces are distinct, so a tool, resource, and prompt may share one public name. |
| Accept | `createMcpServer()` registers prompts through the official SDK. A handler may return text, JSON-compatible data, or an SDK-valid prompt result. Text and JSON-compatible values become one `user` text message. Handler failures return a generic safe message without application exception text or stack traces. |
| Excluded | Prompt argument schemas/inference, automatic argument inference from TypeScript parameter types, and prompt template files. |

## Server construction

```ts
import {
  resolveMcpServerInstance,
  type InstanceResolver,
} from "type-mcp";

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
| Accept | `InstanceResolver<T>` accepts the decorated constructor for `T` and returns `T` or `Promise<T>`. `resolveMcpServerInstance()` uses `defaultInstanceResolver` only for a zero-argument constructor; that direct-construction path is rejected at compile time for classes requiring dependencies. Passing a custom resolver enables dependency-requiring constructors. `createMcpServer()` accepts the same resolver boundary. The default resolver preserves its synchronous return type. |
| Deferred | stdio and HTTP adapter work. |
| Excluded | Built-in NestJS `ModuleRef`, request-scoped provider semantics, and global service location. |

## HTTP adapter

```ts
const handler = createMcpHandler(() => createMcpServer(CatalogServer));
export { handler as GET, handler as POST, handler as DELETE };
```

| Case | Behavior |
| --- | --- |
| Deferred | `createMcpHandler()` currently remains a placeholder. Streamable HTTP transport behavior is planned for the HTTP adapter task. |
| Excluded | OAuth, custom durable sessions, Express middleware, and legacy SSE transport. |

## Metadata immutability

`getMcpServerDefinition()` returns a newly allocated, frozen server definition, component arrays, and component records on every read. Tool `input` schemas retain the caller-supplied Zod object-schema identity: schemas are executable mutable objects and are not cloned or frozen by type-mcp. Consumers should treat a schema supplied to a decorator as immutable after declaration.

## Compatibility policy

Public decorator option names, exported definitions, `InstanceResolver`, and handler signatures are semver-governed once released. Any breaking change requires an ADR, migration note, and a major release decision.

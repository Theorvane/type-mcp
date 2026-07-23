# Decorator API contract

**Repository release target:** `@theorvane/type-mcp@0.2.0` includes metadata declarations, definition validation, the resolver seam, MCP SDK compilation for tools/static resources/prompts, the Node stdio helper, and the Fetch Streamable HTTP adapter. LangChain interoperability is exposed separately at `@theorvane/type-mcp/langchain`.

## Server declaration

```ts
import { McpServer, McpTool } from "@theorvane/type-mcp";
import { createMcpHandler } from "@theorvane/type-mcp/http";

@McpServer({ name: "catalog", version: "0.2.0" })
class CatalogServer {}
```

| Case | Behavior |
| --- | --- |
| Accept | `name` and `version` identify one decorated server class. The decorator records an immutable server definition for later compilation. `readMcpServerDefinition()` rejects an undecorated class with `TypeMcpDefinitionError`. |
| Accept | `createMcpServer()` validates and compiles a decorated definition through an explicit resolver. |
| Excluded | Automatic application-container discovery and inferred application metadata. |

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
| Accept | A method name is used as the tool name unless an explicit `name` is supplied. `input` must be a Zod object schema. The decorator records metadata only; runtime validation and invocation are planned. `readMcpServerDefinition()` rejects duplicate tool names. |
| Deferred | Runtime argument validation, handler invocation, and safe MCP errors are planned for compiler tasks. |
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
| Deferred | Resource registration and safe handler errors are planned for compiler tasks. |
| Excluded | URI templates, subscription/push resources, and persistence/caching policies. |

## Prompt declaration

```ts
@McpPrompt({
  name: "summarize-product",
  description: "Prepare a product-summary prompt.",
})
summarizeProduct(sku: string) {
  return `Summarize product ${sku}.`;
}
```

| Case | Behavior |
| --- | --- |
| Accept | A named method is recorded as a prompt declaration. `readMcpServerDefinition()` rejects duplicate prompt names. Component namespaces are distinct, so a tool, resource, and prompt may share one public name. |
| Deferred | Prompt registration, result normalization, and safe handler errors are planned for compiler tasks. |
| Excluded | Automatic argument inference from TypeScript parameter types and prompt template files. |

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
| Deferred | `createMcpServer()` remains a placeholder; it will consume this seam when SDK compilation is implemented. |
| Excluded | Built-in application-container resolution, request-scoped semantics, and global service location. |

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

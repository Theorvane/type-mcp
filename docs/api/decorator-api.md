# Decorator API contract

**Public package:** [`@theorvane/type-mcp@0.2.0`](https://www.npmjs.com/package/@theorvane/type-mcp) provides decorator declarations, definition validation, MCP SDK compilation for tools/static resources/prompts, a Node stdio helper, and a Fetch Streamable HTTP adapter. LangChain interoperability is isolated at `@theorvane/type-mcp/langchain`.

## Server declaration

```ts
import { McpServer, McpTool, createMcpServer } from "@theorvane/type-mcp";
import { createMcpHandler } from "@theorvane/type-mcp/http";

@McpServer({ name: "catalog", version: "0.2.0" })
class CatalogServer {}
```

| Case | Behavior |
| --- | --- |
| Accept | `name` and `version` identify one decorated server class. The decorator records an immutable server definition. |
| Validate and compile | `createMcpServer()` validates the definition, resolves an instance explicitly, and compiles it into an official MCP SDK `McpServer`. |
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
| Accept | A method name is used as the tool name unless an explicit `name` is supplied. `input` must be a Zod object schema. `readMcpServerDefinition()` rejects duplicate tool names. |
| Runtime | The compiler registers the validated tool with the MCP SDK. Zod validates tool input before the decorated handler runs, and failures use the package's safe tool-result boundary. |
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
| Runtime | The compiler registers static resources with the MCP SDK and invokes the decorated handler when a client reads the resource. |
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
| Runtime | The compiler registers prompts with the MCP SDK and normalizes supported handler results into MCP prompt messages. |
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
| Runtime | `createMcpServer()` uses this resolver seam before compiling the decorated definition. |
| Excluded | Built-in application-container resolution, request-scoped semantics, and global service location. |

## HTTP adapter

```ts
const handler = createMcpHandler(() => createMcpServer(CatalogServer));
export { handler as GET, handler as POST, handler as DELETE };
```

| Case | Behavior |
| --- | --- |
| Runtime | `createMcpHandler()` adapts Web Standard `Request`/`Response` values to the SDK's Streamable HTTP transport. It owns MCP protocol framing and transport sessions. |
| Application-owned | Route registration, authentication, authorization, deployment, observability, and durable session policy remain in the host application. |
| Excluded | OAuth policy, custom durable sessions, Express middleware, and legacy SSE transport. |

## Metadata immutability

`getMcpServerDefinition()` returns a newly allocated, frozen server definition, component arrays, and component records on every read. Tool `input` schemas retain the caller-supplied Zod object-schema identity: schemas are executable mutable objects and are not cloned or frozen by TypeMCP. Consumers should treat a schema supplied to a decorator as immutable after declaration.

## Compatibility policy

Public decorator option names, exported definitions, `InstanceResolver`, compiler and transport entry points, and handler signatures are semver-governed. Any breaking change requires an ADR, migration note, and a major release decision.

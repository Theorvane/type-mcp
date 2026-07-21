# Decorator API contract

**Status:** Metadata declarations are implemented. SDK compilation, instance resolution, stdio, and HTTP transport remain planned MVP work.

## Server declaration

```ts
@McpServer({ name: "catalog", version: "0.1.0" })
class CatalogServer {}
```

| Case | Behavior |
| --- | --- |
| Accept | `name` and `version` identify one decorated server class. The decorator records an immutable server definition for later compilation. |
| Deferred | Compilation and `TypeMcpDefinitionError` are planned for a later core compiler task. |
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
| Accept | A method name is used as the tool name unless an explicit `name` is supplied. `input` must be a Zod object schema. The decorator records metadata only; runtime validation and invocation are planned. |
| Deferred | Runtime argument validation, handler invocation, safe MCP errors, and duplicate-name checks are planned for compiler tasks. |
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
| Accept | A static explicit URI and optional MIME type are recorded as one resource declaration. |
| Deferred | Resource registration, declaration validation, duplicate checks, and safe handler errors are planned for compiler tasks. |
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
| Accept | A named method is recorded as a prompt declaration. |
| Deferred | Prompt registration, result normalization, duplicate checks, and safe handler errors are planned for compiler tasks. |
| Excluded | Automatic argument inference from TypeScript parameter types and prompt template files. |

## Server construction

```ts
const server = await createMcpServer(CatalogServer, {
  resolver: customResolver,
});
```

| Case | Behavior |
| --- | --- |
| Deferred | `createMcpServer()` currently remains a placeholder. Instance resolution and construction failures are planned for later tasks. |
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

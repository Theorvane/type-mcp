# Decorator API contract

**Status:** Planned MVP API. Names and signatures are design targets until code and tests land.

## Server declaration

```ts
@McpServer({ name: "catalog", version: "0.1.0" })
class CatalogServer {}
```

| Case | Behavior |
| --- | --- |
| Accept | `name` and `version` identify one decorated server class. |
| Error | Compiling a class without `@McpServer` fails with `TypeMcpDefinitionError`. |
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
| Accept | A method name is used as the tool name unless an explicit `name` is supplied. `input` is a Zod object schema; sync and async methods are supported. |
| Error | Invalid arguments do not invoke the method and become a safe MCP validation error. A handler throw becomes a generic safe MCP error. Duplicate public tool names fail before registration. |
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
| Accept | A static explicit URI and optional MIME type register one resource handler. |
| Error | Invalid/missing declaration data or duplicate public resource identity fails during compilation. Handler errors are converted safely. |
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
| Accept | A named method registers a prompt handler. Sync and async returns are normalized to MCP prompt content. |
| Error | Duplicate public prompt names fail at compilation; unexpected handler failures return a safe MCP error. |
| Excluded | Automatic argument inference from TypeScript parameter types and prompt template files. |

## Server construction

```ts
const server = await createMcpServer(CatalogServer, {
  resolver: customResolver,
});
```

| Case | Behavior |
| --- | --- |
| Accept | The default resolver constructs the class; a custom resolver may return an instance or Promise. |
| Error | Resolver failure prevents usable server construction and is surfaced as a framework construction failure. |
| Excluded | Built-in NestJS `ModuleRef`, request-scoped provider semantics, and global service location. |

## HTTP adapter

```ts
const handler = createMcpHandler(() => createMcpServer(CatalogServer));
export { handler as GET, handler as POST, handler as DELETE };
```

| Case | Behavior |
| --- | --- |
| Accept | A Fetch `Request` is handled through the official SDK's Web Standard Streamable HTTP transport. |
| Error | Unsupported HTTP methods return an adapter-compatible method error. Protocol/session errors follow SDK transport behavior. |
| Excluded | OAuth, custom durable sessions, Express middleware, and legacy SSE transport. |

## Compatibility policy

Public decorator option names, exported definitions, `InstanceResolver`, and handler signatures are semver-governed once released. Any breaking change requires an ADR, migration note, and a major release decision.

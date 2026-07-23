<div align="center">
  <img src="docs/assets/type-mcp-hero.png" alt="Abstract decorator tiles flowing through a modular core toward web and dependency integrations" width="100%" />

  <h1>TypeMCP</h1>

  **Decorator-first MCP declarations for strict TypeScript.**

  [![npm](https://img.shields.io/npm/v/type-mcp?style=flat-square&label=npm)](https://www.npmjs.com/package/type-mcp)
  [![Node](https://img.shields.io/node/v/type-mcp?style=flat-square)](package.json)
  [![MCP](https://img.shields.io/badge/Model%20Context%20Protocol-SDK%20first-7C3AED?style=flat-square)](https://modelcontextprotocol.io/)
  [![License](https://img.shields.io/badge/license-MIT-111827?style=flat-square)](LICENSE)
</div>

> **Published surface — [`type-mcp@0.1.0`](https://www.npmjs.com/package/type-mcp):** standard decorators and immutable metadata reads are available. Definition validation, instance resolvers, MCP SDK compilation, stdio, `type-mcp/http` Streamable HTTP, and `type-mcp/langchain` are **not included in the published release**.
>
> **Repository-development status:** the current `main` branch implements declaration validation, the resolver seam, SDK compilation, stdio, the `type-mcp/http` Streamable HTTP adapter, and the tools-only `type-mcp/langchain` adapter. Those additions are not yet a promise of availability from npm until a release publishes them.

TypeMCP keeps MCP declarations beside TypeScript classes without coupling the core to a web framework. Install it when you need a strict, inspectable declaration layer and want application code ready for later runtime support.

## Fast path for developers and agents

1. Check the published capability table below. Do not call an API marked **reserved** or **planned**.
2. Install [`type-mcp` from npm](https://www.npmjs.com/package/type-mcp) with `zod`.
3. Use standard TypeScript decorators to declare a server surface.
4. Inspect the declaration through `getMcpServerDefinition()` at an application boundary.
5. Stop at the metadata boundary in `0.1.0`; do not register a transport or invoke an MCP runtime through TypeMCP.

Agents should start with [the agent integration guide](docs/guides/agent-integration.md). It defines an evidence-first workflow and prevents unavailable runtime APIs from being mistaken for supported features.

## Install

TypeMCP requires **Node.js 20 or later** and TypeScript with standard (Stage 3) decorator support.

```bash
npm install type-mcp zod
```

The package is ESM-first and also exposes a CommonJS root export. TypeScript projects should use Node-aware module resolution. This `tsconfig.json` baseline matches the package contract:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022", "ESNext.Decorators"],
    "strict": true,
    "verbatimModuleSyntax": true
  }
}
```

Do not enable TypeScript's legacy `experimentalDecorators` mode for these standard decorator examples. See [configuration and compatibility](docs/guides/configuration.md) for ESM, CommonJS, and decorator details.

## Define and inspect a server declaration

Create `src/catalog-server.ts`:

```ts
import { z } from "zod";
import {
  getMcpServerDefinition,
  McpPrompt,
  McpResource,
  McpServer,
  McpTool,
} from "type-mcp";

@McpServer({ name: "catalog", version: "0.1.0" })
export class CatalogServer {
  @McpTool({
    description: "Look up a catalog item by SKU.",
    input: z.object({ sku: z.string().min(1) }),
  })
  findProduct({ sku }: { sku: string }) {
    return { sku, available: true };
  }

  @McpResource({
    uri: "config://catalog",
    mimeType: "application/json",
    description: "Static catalog configuration.",
  })
  readConfig() {
    return { region: "ap-northeast-2" };
  }

  @McpPrompt({ description: "Prepare a product summary request." })
  summarizeProduct() {
    return "Summarize the selected catalog product.";
  }
}

const definition = getMcpServerDefinition(CatalogServer);
console.log(definition?.name); // "catalog"
console.log(definition?.tools[0]?.name); // "findProduct"
```

`getMcpServerDefinition()` returns `undefined` for a class without `@McpServer`. For a decorated class, it returns a newly allocated frozen metadata container on every call. Zod schemas retain their original identity, so treat a schema passed to a decorator as immutable after declaration.

The methods above are ordinary application methods; **`0.1.0` does not validate declarations, compile, invoke, or transport them as MCP operations**. This example proves the declaration surface, not a runnable MCP server. Follow the [getting-started guide](docs/guides/getting-started.md) for the complete version boundary.

## Capability map

| Surface | `type-mcp@0.1.0` | What it does |
| --- | --- | --- |
| `@McpServer` | Available | Records server name and version metadata. |
| `@McpTool` | Available | Records a method name, optional public name/description, and Zod object schema. |
| `@McpResource` | Available | Records a static resource URI and optional metadata. |
| `@McpPrompt` | Available | Records a named prompt declaration. |
| `getMcpServerDefinition()` | Available | Reads a fresh frozen metadata copy; returns `undefined` for undecorated classes. |
| `createMcpServer()` | Reserved / throws | Exported only as a future stable entry point; not usable in `0.1.0`. |
| `type-mcp/http` / `createMcpHandler()` | Reserved / throws | Exported subpath only; no stdio or Streamable HTTP transport exists in `0.1.0`. |
| Definition validation and `TypeMcpDefinitionError` | Unreleased | Available in repository development, not in the published package. |
| `InstanceResolver<T>` / `resolveMcpServerInstance()` | Unreleased | Available in repository development, not in the published package. |
| `type-mcp/langchain` / `createLangChainTools()` | Unreleased | Tools-only LangChain structured-tool adapter in repository development; LangGraph `ToolNode` composition remains consumer-owned. |

## Documentation map

- [Getting started](docs/guides/getting-started.md) — install, declare, inspect, and respect the `0.1.0` boundary.
- [Configuration and compatibility](docs/guides/configuration.md) — Node, ESM/CommonJS, TypeScript decorators, schemas, and release boundaries.
- [Agent integration guide](docs/guides/agent-integration.md) — evidence-first coding-agent workflow and no-runtime rule.
- [HTTP framework integration](docs/guides/http-and-nextjs.md) — repository-source Streamable HTTP example and Fetch/Next.js route shape; not yet part of npm `0.1.0`.
- [Standalone HTTP example](examples/standalone-http/README.md) — exact source and smoke-test commands for the repository implementation.
- [LangChain and LangGraph integration](docs/guides/langchain-langgraph.md) — repository-source tools-only adapter and consumer-owned `ToolNode` composition; not yet part of npm `0.1.0`.
- [LangGraph ToolNode example](examples/langgraph-tools/README.md) — exact in-memory source example and smoke-test command.
- [Decorator API contract](docs/api/decorator-api.md) — repository API target; check its status notices before using unreleased APIs.
- [Architecture overview](docs/architecture/overview.md) — package boundaries and planned runtime direction.
- [MVP scope](docs/product/mvp-scope.md) — planned product capabilities.
- [Contributing](CONTRIBUTING.md) — contribution workflow and local verification.
- [npm package](https://www.npmjs.com/package/type-mcp) — published releases and install metadata.

## Develop locally

```bash
git clone https://github.com/Theorvane/type-mcp.git
cd type-mcp
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm run verify:package
npm run verify:publish
```

Repository changes follow **Issue → issue-numbered branch → pull request → review and CI → squash merge**. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)

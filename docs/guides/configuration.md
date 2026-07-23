# Configuration and compatibility

`@theorvane/type-mcp@0.2.0` is the repository release target for this TypeScript declaration and runtime package. Configuration determines whether TypeScript emits standard decorators and whether the runtime can resolve the package's ESM/CJS exports; applications configure their own hosting and transport lifecycle around installed MCP adapters.

## Runtime and package manager

Use Node.js 20 or later. After `npm view @theorvane/type-mcp@0.2.0 version` succeeds, install TypeMCP and Zod as application dependencies:

```bash
npm install @theorvane/type-mcp zod
```

The package name and import are scoped to Theorvane:

```ts
import { McpServer, McpTool } from "@theorvane/type-mcp";
```

The `0.2.0` release target exports `@theorvane/type-mcp/http`. Add it only where the application owns Fetch hosting, session handling, and authorization.

## TypeScript decorators

Use TypeScript's standard decorator implementation. The configuration must include the decorator library and should retain strict checking:

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

Do not enable the legacy `experimentalDecorators` compiler option for this API. Standard decorators provide the metadata object that TypeMCP uses to associate method declarations with a decorated class. A build that compiles legacy decorators is not a supported configuration for the examples in this repository.

Projects using Babel, SWC, or another TypeScript transpiler must confirm that their configured transform supports standard decorators and emits compatible metadata behavior. Run a focused declaration test after changing a compiler transform rather than relying on syntax acceptance alone.

## ESM and CommonJS

The package exports both ESM and CommonJS entry points:

| Consumer | Root loading form |
| --- | --- |
| ESM / TypeScript NodeNext | `import { McpServer } from "@theorvane/type-mcp"` |
| CommonJS runtime | `const { McpServer } = require("@theorvane/type-mcp")` |

Decorator syntax is compiled by TypeScript before Node loads the module, so the CommonJS form does not remove the requirement for a standard decorator-compatible compiler configuration. Type-only imports should use TypeScript's `import type` form for the public definition interfaces:

```ts
import type { McpServerDefinition, McpToolOptions } from "@theorvane/type-mcp";
```

## Schemas and declaration names

`@McpTool` requires a Zod object schema in its `input` option. Keep the schema owned by the application and treat it as immutable once used in a declaration:

```ts
const findInput = z.object({ id: z.string().min(1) });

@McpTool({ input: findInput })
find({ id }: z.infer<typeof findInput>) {
  return id;
}
```

A missing component `name` defaults to the method name. `0.2.0` validates the decorated definition before compilation; application tests should still protect domain naming conventions.

## Registry release versus repository development

The repository release target is `@theorvane/type-mcp@0.2.0`. After publication, verify the npm version before treating it as installable. Its root exports include `McpServer`, `McpTool`, `McpResource`, `McpPrompt`, `getMcpServerDefinition`, `readMcpServerDefinition`, `TypeMcpDefinitionError`, `InstanceResolver`, `resolveMcpServerInstance`, `createMcpServer`, and `startStdioServer`. The `@theorvane/type-mcp/http` and `@theorvane/type-mcp/langchain` subpaths expose their respective adapters.

Before upgrading, read the release notes and inspect the package's generated type declarations. Treat a feature as available only when a released version documents it and the installed package exports it.

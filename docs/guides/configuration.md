# Configuration and compatibility

`type-mcp@0.1.0` is a TypeScript declaration and metadata package. Configuration determines whether TypeScript emits standard decorators and whether the runtime can resolve the package's ESM/CJS exports; it does not configure an MCP transport because no transport is published yet.

## Runtime and package manager

Use Node.js 20 or later. Install TypeMCP and Zod as application dependencies:

```bash
npm install type-mcp zod
```

The package name and import are unscoped:

```ts
import { McpServer, McpTool } from "type-mcp";
```

The package exports `type-mcp/http`, but its handler throws in `0.1.0`. Do not add that import to a running application yet.

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
| ESM / TypeScript NodeNext | `import { McpServer } from "type-mcp"` |
| CommonJS runtime | `const { McpServer } = require("type-mcp")` |

Decorator syntax is compiled by TypeScript before Node loads the module, so the CommonJS form does not remove the requirement for a standard decorator-compatible compiler configuration. Type-only imports should use TypeScript's `import type` form for the public definition interfaces:

```ts
import type { McpServerDefinition, McpToolOptions } from "type-mcp";
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

A missing component `name` defaults to the method name. The `0.1.0` package records names without enforcing uniqueness. Application tests should protect naming conventions until a future released validation API explicitly documents duplicate detection.

## Published versus repository development

The npm tag is [`type-mcp@0.1.0`](https://www.npmjs.com/package/type-mcp). Its runtime exports are `McpServer`, `McpTool`, `McpResource`, `McpPrompt`, `getMcpServerDefinition`, and reserved `createMcpServer`. It does not include `readMcpServerDefinition`, `TypeMcpDefinitionError`, `InstanceResolver`, or `resolveMcpServerInstance`, even if those names appear in repository development work or unreleased documentation.

Before upgrading, read the release notes and inspect the package's generated type declarations. Treat a feature as available only when a released version documents it and the installed package exports it.

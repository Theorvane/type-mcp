# Petstore project setup: a strict TypeScript workspace

This is the first chapter of the TypeMCP Petstore curriculum. It creates a small local project that can compile a decorated server before the application selects a runtime boundary.

> **Published version:** The examples target [`@theorvane/type-mcp@0.4.0`](https://www.npmjs.com/package/@theorvane/type-mcp). They use standard TypeScript decorators, not legacy `experimentalDecorators`.

## Before you start

- Node.js 20 or later and npm.
- A terminal in a directory where you can create a new project.
- A future application-owned Petstore client or service. This chapter deliberately does not create credentials, choose an API, or make a network request.

## Workspace checkpoint

At the end of this chapter, the workspace has this shape:

```text
petstore-workspace/
├── package.json
├── tsconfig.json
└── src/
    └── petstore-client.ts
```

The project can typecheck. It does not expose an MCP server yet; that is the next chapter. `DOM`/`DOM.Iterable` cover the published MCP SDK Web API types and `@types/node` covers local Node globals such as `console`.

## Install

Create the workspace, mark it as ESM, and install the released package plus the tools used by the guide:

```bash
mkdir petstore-workspace
cd petstore-workspace
npm init -y
npm pkg set type=module
npm install @theorvane/type-mcp@0.4.0 zod
npm install --save-dev typescript tsx @types/node
npm pkg set scripts.check="tsc --noEmit"
```

`@theorvane/type-mcp` provides decorators, definition inspection, compilation, and a stdio helper. `zod` is an application dependency because the application supplies tool input schemas. `tsx` runs the local TypeScript entry point in the later stdio chapter; it is not a TypeMCP runtime requirement.

## Configure TypeScript

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022", "ESNext.Decorators", "DOM", "DOM.Iterable"],
    "types": ["node"],
    "strict": true,
    "skipLibCheck": true,
    "verbatimModuleSyntax": true,
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src/**/*.ts"]
}
```

Do **not** enable `experimentalDecorators`: these examples use the current standard decorator proposal. See [configuration and compatibility](configuration.md) before applying this configuration to an existing CommonJS project or another decorator framework.

## Create the application seam

Create `src/petstore-client.ts`:

```ts
export interface PetstoreClient {
  findProduct(sku: string): Promise<{
    readonly sku: string;
    readonly name: string;
    readonly available: boolean;
  }>;
}
```

This interface is intentionally application-owned. In a real project, its implementation can call a database, domain service, or credentialed HTTP API. TypeMCP does not choose or construct that dependency.

## Run and verify

Run the typecheck:

```bash
npm run check
```

## Expected behavior

TypeScript exits successfully without creating a listener, network request, model call, or MCP session. The workspace now has strict ESM and decorator support plus a typed seam for the application’s catalog dependency.

## Failure guide

- **`Cannot find name 'console'` or a Node global:** this minimal chapter has no Node global usage. If an application entry point needs Node APIs, add the appropriate Node type configuration to that application rather than changing the decorator setting.
- **`Cannot use import statement outside a module`:** confirm `package.json` has `"type": "module"` and keep `module` and `moduleResolution` set to `NodeNext`.
- **Decorator errors after copying the next chapter:** remove legacy `experimentalDecorators`; the guide’s `ESNext.Decorators` library entry is required for Stage 3 decorator typing.

## Responsibility boundary

You own the workspace, package manager, dependency versions, credentials, Petstore client implementation, and project lifecycle. TypeMCP does not create a project, configure deployment, host an endpoint, authorize callers, persist state, select a model, or make a Petstore request.

## Next steps

Continue with [Petstore TypeMCP foundation](petstore-typemcp-foundation.md) to declare the server, inspect its definition, compile it through an explicit resolver, and start the local stdio boundary.

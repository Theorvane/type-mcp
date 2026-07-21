<div align="center">
  <img src="docs/assets/type-mcp-hero.png" alt="Abstract decorator tiles flowing through a modular core toward web and dependency integrations" width="100%" />

  <h1>TypeMCP</h1>

  **Decorator-first MCP servers for TypeScript.**

  [![MVP status](https://img.shields.io/badge/status-MVP%20in%20development-5B5BD6?style=flat-square)](docs/product/mvp-scope.md)
  [![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white)](tsconfig.base.json)
  [![MCP](https://img.shields.io/badge/Model%20Context%20Protocol-SDK%20first-7C3AED?style=flat-square)](https://modelcontextprotocol.io/)
  [![License](https://img.shields.io/badge/license-MIT-111827?style=flat-square)](LICENSE)
</div>

TypeMCP is a decorator-first TypeScript framework for defining [Model Context Protocol](https://modelcontextprotocol.io/) servers. It keeps declarations close to application code while preserving a framework-neutral core that can later support Fetch-based HTTP and NestJS dependency injection without making either a core dependency.

> **Current status:** Decorator metadata storage, definition validation, the async-capable instance-resolver seam, MCP SDK compilation for tools/resources/prompts, the Node stdio helper, and a Fetch-compatible Streamable HTTP handler are implemented and verified.

## Define MCP components where they belong

Decorate a class with the server, tool, resource, and prompt declarations that describe its MCP surface. TypeMCP records an immutable definition, then `createMcpServer()` compiles validated tools, static resources, and prompts into an MCP SDK server.

```ts
import { z } from "zod";
import { McpServer, McpTool } from "type-mcp";

@McpServer({ name: "calculator", version: "0.1.0" })
class CalculatorServer {
  @McpTool({
    description: "Add two numbers.",
    input: z.object({ left: z.number(), right: z.number() }),
  })
  add({ left, right }: { left: number; right: number }) {
    return String(left + right);
  }
}
```

The declarations above are available today. `createMcpServer()` compiles decorated tools, static resources, and prompts through the official SDK; `startStdioServer()` connects the compiled server to Node stdio; and `createMcpHandler()` creates a Fetch-compatible Streamable HTTP handler.

## What exists today

| Surface | Status | Details |
| --- | --- | --- |
| `@McpServer` | Available | Records immutable server identity metadata. |
| `@McpTool` | Available | Records a method name, optional public name/description, and Zod object schema. |
| `@McpResource` | Available | Records a static resource declaration. |
| `@McpPrompt` | Available | Records a named prompt declaration. |
| `getMcpServerDefinition()` | Available | Reads a newly allocated frozen metadata definition container. |
| `readMcpServerDefinition()` | Available | Validates a decorated class, rejects duplicate names within each MCP component namespace with `TypeMcpDefinitionError`, then returns a newly allocated deeply frozen definition copy. |
| `TypeMcpDefinitionError` | Available | Safe declaration-validation error for undecorated classes and duplicate public component names. |
| `InstanceResolver<T>` | Available | Framework-neutral synchronous/asynchronous construction seam; direct construction is restricted to zero-argument classes. |
| `createMcpServer()` | Available | Validates declarations, resolves an instance, and registers decorated tools, static resources, and prompts with the official MCP SDK. |
| `startStdioServer()` | Available | Connects a compiled SDK server to the official Node `StdioServerTransport`. |
| `type-mcp/http` | Available | Exposes `createMcpHandler()` for Fetch-compatible, SDK-managed Streamable HTTP sessions. |
| NestJS integration | Deferred | Will bridge Nest discovery and DI through the resolver seam. |

## Design principles

**Decorators describe; compilers execute.** Decorators are declaration-only. They do not instantiate application classes, start transports, or perform runtime protocol registration.

**Framework neutrality is a boundary.** The root `type-mcp` API has no NestJS, Next.js, or web-server dependency. Its future runtime compiler stays framework-neutral; `type-mcp/http` is an opt-in subpath for Fetch transport support.

**The MCP SDK remains authoritative.** TypeMCP is an ergonomic definition and compilation layer, not a replacement protocol implementation.

**Runtime boundaries must stay explicit.** The tool compiler validates raw input with Zod, and compiler handlers return safe MCP-visible content without exposing application stacks. The same boundary is required for future HTTP transport work.

## Package surface

| Import | Role | Status |
| --- | --- | --- |
| `type-mcp` | Decorators, metadata, declaration validation, resolver seam, compiler, and Node stdio helper | Declarations/validation/resolver, compiler, and stdio available |
| `type-mcp/http` | Fetch-compatible Streamable HTTP adapter subpath | Available — SDK-managed Streamable HTTP sessions |
| Future NestJS integration | Discovery and DI integration | Deferred |

## Explore the project

- [Product vision](docs/product/vision.md) — the problem, users, and target outcomes.
- [MVP scope](docs/product/mvp-scope.md) — included boundaries and explicitly deferred work.
- [Architecture overview](docs/architecture/overview.md) — package layers, target runtime flow, and NestJS boundary.
- [Decorator API contract](docs/api/decorator-api.md) — available metadata behavior and planned compiler contracts.
- [Implementation plan](docs/planning/2026-07-21-mvp-implementation-plan.md) — TDD task order and acceptance criteria.
- [Contributing guide](CONTRIBUTING.md) — issue → branch → PR workflow and local checks.
- [npm release readiness](docs/guides/npm-release.md) — scope ownership and release safeguards.

## Develop locally

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm run verify:package
npm run verify:publish
```

Every repository change follows a focused **GitHub Issue → issue-numbered branch → pull request → review and CI → squash merge** flow. See [CONTRIBUTING.md](CONTRIBUTING.md) for the full contributor workflow.

## License

[MIT](LICENSE)

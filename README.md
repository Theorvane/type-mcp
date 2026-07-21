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

> **Current status:** Decorator metadata storage, definition validation, and an async-capable instance-resolver seam are implemented and verified. MCP SDK compilation, stdio, and HTTP transport are planned MVP work.

## Define MCP components where they belong

Decorate a class with the server, tool, resource, and prompt declarations that describe its MCP surface. TypeMCP records an immutable definition that later compiler work will turn into an MCP SDK server.

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

The declarations above are available today. Calling `createMcpServer()`, connecting stdio, or serving Streamable HTTP is intentionally not available until their focused implementation issues land.

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
| `createMcpServer()` | Planned | Will validate declarations, resolve instances, and register them with the official MCP SDK. |
| `type-mcp/http` | Planned | Will expose a Fetch `Request` → `Response` Streamable HTTP adapter. |
| NestJS integration | Deferred | Will bridge Nest discovery and DI through the resolver seam. |

## Design principles

**Decorators describe; compilers execute.** Decorators are declaration-only. They do not instantiate application classes, start transports, or perform runtime protocol registration.

**Framework neutrality is a boundary.** The root `type-mcp` API has no NestJS, Next.js, or web-server dependency. Its future runtime compiler stays framework-neutral; `type-mcp/http` is an opt-in subpath for Fetch transport support.

**The MCP SDK remains authoritative.** TypeMCP is an ergonomic definition and compilation layer, not a replacement protocol implementation.

**Runtime boundaries must stay explicit.** Planned compiler work will validate raw tool input with Zod and convert handler failures into safe MCP-visible errors without exposing application stacks.

## Package surface

| Import | Role | Status |
| --- | --- | --- |
| `type-mcp` | Decorators, metadata, declaration validation, resolver seam, and future compiler/stdio helper | Declarations/validation/resolver available; compiler and transport planned |
| `type-mcp/http` | Fetch-compatible Streamable HTTP adapter subpath | Planned |
| Future NestJS integration | Discovery and DI integration | Deferred |

## Explore the project

- [Product vision](docs/product/vision.md) — the problem, users, and target outcomes.
- [MVP scope](docs/product/mvp-scope.md) — included boundaries and explicitly deferred work.
- [Architecture overview](docs/architecture/overview.md) — package layers, target runtime flow, and NestJS boundary.
- [Decorator API contract](docs/api/decorator-api.md) — available metadata behavior and planned compiler contracts.
- [Implementation plan](docs/planning/2026-07-21-mvp-implementation-plan.md) — TDD task order and acceptance criteria.
- [Contributing guide](CONTRIBUTING.md) — issue → branch → PR workflow and local checks.
- [Code of Conduct](CODE_OF_CONDUCT.md) — expectations for all project spaces.
- [Security policy](SECURITY.md) — private vulnerability reporting.
- [Support guide](SUPPORT.md) — where to ask usage and contribution questions.
- [Open-source launch checklist](docs/guides/open-source-launch.md) — public-repository safeguards and settings.
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

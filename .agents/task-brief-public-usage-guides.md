# Task brief — public usage documentation

**Owner:** Hermes Agent
**Date:** 2026-07-21
**Related issue:** #27
**Branch:** `docs/27-public-usage-guides`

## Objective

Make the published `type-mcp@0.1.0` package understandable and usable by developers and coding agents without overstating unreleased runtime features.

## Documentation contract

- README exposes npm installation, Node/TypeScript prerequisites, a valid decorator/metadata-inspection example, exact capability status, and an agent quick path.
- Guides cover getting started, configuration/compatibility, and an evidence-first agent workflow.
- Examples use only public `0.1.0` exports: decorators and `getMcpServerDefinition()`.
- Definition validation, resolver APIs, SDK compilation, stdio, HTTP, and NestJS are explicitly marked unreleased or deferred.

## Verification

- Compile the documented standard-decorator example in a clean temporary consumer against published `type-mcp@0.1.0`.
- Verify ESM and CommonJS public export lists against the installed package.
- Run repository lint, typecheck, tests, build, package/publish verification, production audit, and whitespace check.
- Review the staged diff and local Markdown links before the pull request.

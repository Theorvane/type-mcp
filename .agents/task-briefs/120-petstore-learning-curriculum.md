# Task brief — runnable TypeMCP Petstore learning curriculum

**Owner:** Hermes Agent

**Date:** 2026-07-29

**Status:** in-progress

**Related plan:** `docs/planning/2026-07-29-reference-first-learning-curricula-implementation.md#phase-1`

## Objective

Publish a source-owned, release-accurate TypeMCP curriculum that a reader can follow from a new strict TypeScript Petstore workspace through declaration inspection, explicit-resolver compilation, and application-owned stdio startup.

## Scope

**In:**
- `docs/guides/petstore-project-setup.md` and `docs/guides/petstore-typemcp-foundation.md`.
- A bounded update to the existing Petstore walkthrough and docs index.
- Documentation-contract coverage for the reader path and package boundary.

**Out:**
- Runtime API, hosting, authorization, persistence, model, credential, deployment, or LangGraph changes.

## Acceptance criteria

- [ ] Every new curriculum guide names prerequisites, workspace checkpoint, install/configuration, files, commands, expected behavior, failure guide, responsibility boundary, and next step.
- [ ] The guide uses release-validated `@theorvane/type-mcp@0.2.2` and `createMcpServer(PetstoreServer, resolver)`.
- [ ] A clean installed consumer compiles the documented named files.
- [ ] The docs contract is observed failing before the new guides and passes after the change.

## Files

- Create: `docs/guides/petstore-project-setup.md`
- Create: `docs/guides/petstore-typemcp-foundation.md`
- Modify: `docs/guides/petstore-walkthrough.md`
- Modify: `docs/README.md`
- Modify: `test/reference-documentation-contract.test.ts`
- Test: `test/reference-documentation-contract.test.ts`

## Red → green evidence

| Stage | Command | Result / expected reason |
| --- | --- | --- |
| Red | `npx vitest run test/reference-documentation-contract.test.ts` | Observed ENOENT for `docs/guides/petstore-project-setup.md`. |
| Green | `npx vitest run test/reference-documentation-contract.test.ts` | 2/2 tests passed after source guides and continuation headings were added. |
| Regression | `npm test && npm run typecheck && npm run lint` | 26 files / 58 tests passed; typecheck and Biome passed. |

## Risks and boundaries

- Examples must remain aligned with the published 0.2.2 package rather than current unpublished source behavior.
- Resolver dependencies, executable lifecycle, authorization, hosting, persistence, models, LangGraph topology, and deployment stay application-owned.

## Review handoff

- Spec review: pending
- Quality review: pending
- Final checks: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm run verify:package`, `npm run verify:publish`, `git diff --check`

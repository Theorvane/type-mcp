# npm release readiness

TypeMCP publishes one public, unscoped package: `type-mcp`. Its Fetch-compatible HTTP entry point is the `type-mcp/http` subpath. The repository is being prepared for public open-source launch; repository visibility and npm package visibility remain separate controls.

## Trusted publication from `main`

1. In npm package settings, configure a Trusted Publisher for package `type-mcp` with GitHub repository `Theorvane/type-mcp`, workflow filename `publish.yml`, and environment `npm`.
2. Do not create an npm token or repository npm secret. The workflow receives npm identity through GitHub Actions OIDC and publishes with provenance.
3. Make a reviewed version change on `dev`; npm versions are immutable and must not already exist in the registry.
4. Promote that reviewed `dev` head to `main` through the protected release PR. The `publish.yml` workflow verifies the package, publishes once, then creates annotated `v<version>` tag and a GitHub Release from the exact `main` SHA.
5. Run the repository checks and inspect the generated tarball:

   ```bash
   npm ci
   npm run lint
   npm run typecheck
   npm test
   npm run verify:package
   npm run verify:publish
   ```

## Safety controls

- Publication runs only on `main` and only after an approved release PR is merged.
- The workflow refuses an existing npm version or `v<version>` tag before publishing, so a version bump is an explicit release decision.
- `npm publish --provenance --access public` completes before the tag and GitHub Release are created. A failed publish therefore cannot leave a misleading release tag.
- The release environment is named `npm`; maintainers can add GitHub Environment approvals there without changing the workflow.

## Safety controls in this repository

- `npm run verify:publish` builds the package and uses `npm pack --dry-run --ignore-scripts` to validate metadata and root/HTTP subpath artifacts.
- Root `prepublishOnly` runs the same verification before `npm publish` is allowed to continue.
- The package has no local `file:` dependencies, so the published tarball is independently installable.

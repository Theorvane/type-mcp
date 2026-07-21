# npm release readiness

TypeMCP publishes one public, unscoped package: `type-mcp`. Its Fetch-compatible HTTP entry point is the `type-mcp/http` subpath. The GitHub repository may remain private; GitHub visibility and npm package visibility are separate controls.

## What must happen before the first release

1. Confirm the unscoped npm name `type-mcp` remains available and that the authenticated npm user owns the publish right.
2. Configure npm trusted publishing for this GitHub repository and a reviewed release workflow. Trusted publishing uses GitHub Actions OIDC instead of a long-lived npm token.
3. Finish and verify the compiler, stdio, and HTTP adapter work. The framework-neutral async-capable resolver seam is implemented, but the current package is not a release candidate: `createMcpServer()` and `createMcpHandler()` still throw placeholder errors.
4. Pick a version that has never been published. npm versions are immutable. Use a prerelease such as `0.1.0-alpha.1` for an early public preview if desired.
5. Run the repository checks and inspect the generated tarball:

   ```bash
   npm ci
   npm run lint
   npm run typecheck
   npm test
   npm run verify:package
   npm run verify:publish
   ```

## First public publish

After the prerequisites are complete and an authorized release issue/PR has been merged, publish the root package:

```bash
npm login
npm whoami
npm publish --access public
```

The manifest sets `publishConfig.access` to `public`, so the explicit access argument is a defensive confirmation. Do not run this command until the version, package contents, and release review are approved.

## Safety controls in this repository

- `npm run verify:publish` builds the package and uses `npm pack --dry-run --ignore-scripts` to validate metadata and root/HTTP subpath artifacts.
- Root `prepublishOnly` runs the same verification before `npm publish` is allowed to continue.
- The package has no local `file:` dependencies, so the published tarball is independently installable.

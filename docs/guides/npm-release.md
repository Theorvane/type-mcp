# npm release readiness

TypeMCP will publish public scoped packages as `@type-mcp/core` and `@type-mcp/http`. The GitHub repository may remain private; GitHub visibility and npm package visibility are separate controls.

## What must happen before the first release

1. Create the `type-mcp` organization at [npmjs.com](https://www.npmjs.com/) or obtain publish permission in an existing organization with that exact name. The npm organization, not the GitHub repository, owns the `@type-mcp` scope.
2. Configure npm trusted publishing for this GitHub repository and the release workflow after a dedicated release workflow is reviewed. Trusted publishing uses GitHub Actions OIDC instead of a long-lived npm token.
3. Finish and verify the compiler, resolver, stdio, and HTTP adapter work. The current packages are not release candidates: `createMcpServer()` and `createMcpHandler()` still throw placeholder errors.
4. Pick a version that has never been published. npm versions are immutable. Use a prerelease such as `0.1.0-alpha.1` for an early public preview if desired.
5. Run the repository checks and inspect the generated tarballs:

   ```bash
   npm ci
   npm run lint
   npm run typecheck
   npm test
   npm run verify:packages
   npm run verify:publish
   ```

## First public publish

After the prerequisites are complete and an authorized release issue/PR has been merged, an organization owner can publish each workspace explicitly:

```bash
npm login
npm whoami
npm publish --workspace @type-mcp/core --access public
npm publish --workspace @type-mcp/http --access public
```

The manifests set `publishConfig.access` to `public`, so the explicit access argument is a defensive confirmation. Do not run either command until the package version, scope ownership, package contents, and release review are approved.

## Safety controls in this repository

- `npm run verify:publish` builds both workspaces and uses `npm pack --dry-run --ignore-scripts` to validate the tarball metadata and included files.
- Each package runs the same verification through `prepublishOnly` before `npm publish` is allowed to continue.
- `@type-mcp/http` depends on the published `@type-mcp/core` version rather than a local `file:` path, so consumers can resolve it from npm.

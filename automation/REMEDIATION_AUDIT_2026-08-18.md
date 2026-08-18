# Remediation Audit — 18 August 2026

## Scope

This audit reviewed the private Antigravity Pharma Dashboard source, package configuration, validation commands, local repository state, and available GitHub authentication. It separates remediable code/configuration matters from owner-controlled or paid external-service gates.

## Completed remediation

The project previously stored `patchedDependencies` and `overrides` under the `pnpm` property of `package.json`. Current pnpm versions no longer read that location. The settings were moved unchanged to `pnpm-workspace.yaml`, with the root package declared as a workspace package. This removes the ignored-settings warning while preserving the Wouter patch and Tailwind transitive override.

The audit also found that `@builder.io/vite-plugin-jsx-loc@0.1.1` declares support only for Vite 4 and 5 while the project uses Vite 7. The plugin adds JSX source-location attributes for development inspection but is not required by the application runtime. It was removed from the Vite configuration and lockfile. The production build, tests, TypeScript check, and formatter all pass without it.

## Validation evidence

| Check | Result |
|---|---|
| `pnpm test` | Passed — 8 test files and 18 tests |
| `pnpm run check` | Passed — TypeScript reported no errors |
| `pnpm run build` | Passed — production client and server bundles generated |
| `pnpm install --frozen-lockfile --ignore-scripts` | Passed — lockfile is current |
| Prettier check for edited configuration | Passed |

## Non-blocking notices

The production build emits a bundle-size advisory for the client JavaScript bundle. pnpm also reports upstream deprecation advisories for Recharts 2 and four transitive packages. These are third-party maintenance notices, not build, type, test, runtime, or security failures in the dashboard. No dependency upgrade was forced because major-version upgrades could change the dashboard UI behavior without a product requirement and must be handled as a separately scoped compatibility change.

## External gates not treated as code failures

Firebase Hosting publication remains blocked by the separate Firebase CLI owner-authentication flow. Firebase billing, a secure Functions deployment, rule deployment, private-record transfer, and owner confirmation of broad OAuth scopes are external controlled actions and were not attempted in this remediation pass. The current application remains live at its existing private Manus deployment.

## GitHub readiness

The GitHub CLI is authenticated as `balajirajput96`. The active project’s `origin` remote is the managed project checkpoint remote, not a GitHub repository. Accessible repositories include several pharma-related repositories, but no GitHub target is configured for this dashboard. The next synchronization step must select a repository explicitly or create a new private dashboard repository; the user’s request authorizes synchronization, but choosing an unrelated existing repository without confirming its intended purpose would risk overwriting unrelated work.

## Dependency-security follow-up

After the private GitHub repository was created, GitHub reported dependency advisories on the default branch. The GitHub Dependabot alerts endpoint itself returned HTTP 403 for the current command-line credential, so the local `pnpm audit` report was used as the authoritative remediation input.

The initial local audit reported 3 critical, 49 high, 77 moderate, and 11 low advisories. Direct dependency updates were applied for the audited AWS SDK, tRPC packages, Axios, Tailwind/Vite packages, pnpm, PostCSS, Drizzle ORM, and Vitest. Streamdown was upgraded from 1.x to 2.5.0 after confirming that the dashboard uses its public `Streamdown` component API. The subsequent regression suite, TypeScript check, and production build passed with Vitest 3.2.7 and Vite 7.3.6.

After those validated upgrades, the local audit reported 0 critical, 5 high, 6 moderate, and 2 low advisories. The remaining vulnerable chains are Express 4 (including `qs`, `path-to-regexp`, and `body-parser`), Recharts 2 (`lodash`), the direct NanoID version, Rollup/Picomatch beneath Vite, and esbuild beneath Drizzle Kit. The next remediation pass must update these components individually and preserve the dashboard’s existing routing and chart behavior.

pnpm’s current documentation states that dependency overrides must be declared at the workspace root in `pnpm-workspace.yaml`. The generated override set was therefore migrated out of `package.json`; however, with the installed pnpm 10.4.1 launcher the existing lockfile remained unchanged after the migration. Direct dependency updates are being used first because they have a demonstrable lockfile effect, followed by compatibility-tested major upgrades where required.

Sources consulted: https://pnpm.io/10.x/settings and https://pnpm.io/cli/audit.

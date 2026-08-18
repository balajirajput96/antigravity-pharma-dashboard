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

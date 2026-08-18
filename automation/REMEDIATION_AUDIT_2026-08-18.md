# Remediation Audit — 18 August 2026

## Scope

This audit reviewed the private Antigravity Pharma Dashboard source, package configuration, validation commands, local repository state, and GitHub security reporting. It distinguishes remediable code and dependency issues from owner-controlled external gates.

## Completed code and dependency remediation

The project package-manager policy was migrated from the deprecated `package.json` `pnpm` property into `pnpm-workspace.yaml`, preserving the Wouter patch and the Tailwind-to-NanoID compatibility override.

The unsupported Vite 4/5-only `@builder.io/vite-plugin-jsx-loc` plugin was removed. Direct and compatibility-tested dependency upgrades were then applied: Express 5, Recharts 3, Streamdown 2, Vite 8, the Vite React plugin 6, Vitest 4, esbuild 0.28, Axios, tRPC, AWS SDK, Tailwind tooling, PostCSS, Drizzle ORM, and related audited dependencies.

Express 5 rejects anonymous wildcard route paths. The storage proxy now uses the named `/manus-storage/*key` wildcard and both SPA fallbacks use pathless middleware. A regression test verifies the storage route contract and empty-key response. Recharts 3 changed public tooltip and legend types; the custom chart wrapper now uses the Recharts 3 content-prop contracts.

## Final validation evidence

| Check | Result |
|---|---|
| `pnpm test` | Passed — 9 test files and 19 tests |
| `pnpm run check` | Passed — TypeScript reported no errors |
| `pnpm run build` | Passed — Vite 8 client and server bundles generated |
| `pnpm install --frozen-lockfile --ignore-scripts` | Passed — lockfile is current |
| Express 5 development restart | Passed — server reports `Server running on http://localhost:3000/` without new wildcard route errors |
| `pnpm exec drizzle-kit --version` and `--help` | Passed — stable database tooling is operational |

## Local security-audit result

The initial local audit reported 3 critical, 49 high, 77 moderate, and 11 low advisories. The final stable dependency graph reports **0 critical, 0 high, 1 moderate, and 0 low** advisories.

The final remaining moderate advisory is inherited from the latest stable `drizzle-kit@0.31.10` development-tooling chain. The available `drizzle-kit@1.0.0-rc.4` release candidate clears that audit item but fails both `drizzle-kit --version` and `--help` against the project’s supported `drizzle-orm@0.45.2` with `ERR_PACKAGE_PATH_NOT_EXPORTED` for `drizzle-orm/_relations`. It was therefore rejected and the latest working stable Drizzle Kit was retained. This advisory is limited to local development tooling; it is not bundled into the deployed application. A future stable Drizzle Kit 1.0 release, paired with a controlled Drizzle ORM migration, is required for a safe final removal.

The production build still emits a bundle-size performance advisory. It is not a security, type, test, or startup failure; the resulting client bundle is smaller after the Vite 8 migration.

## External gates

Firebase Hosting publication remains blocked by the separate Firebase CLI owner-authentication flow. No billing linkage, Firebase Functions deployment, rules deployment, private-record transfer, or external outreach was attempted.

## GitHub readiness

The GitHub CLI is authenticated as `balajirajput96`. The private project repository is `https://github.com/balajirajput96/antigravity-pharma-dashboard`. The final tested remediation commit remains to be synchronized to that repository.

## Sources

- https://pnpm.io/10.x/settings
- https://pnpm.io/cli/audit

# Remediation Audit — 18 August 2026

## Scope

This audit reviewed the private Antigravity Pharma Dashboard source, package configuration, validation commands, local repository state, and GitHub security reporting. It distinguishes remediable code and dependency issues from owner-controlled external gates.

## Completed code and dependency remediation

The project package-manager policy was migrated from the deprecated `package.json` `pnpm` property into `pnpm-workspace.yaml`, preserving the Wouter patch and the Tailwind-to-NanoID compatibility override.

The unsupported Vite 4/5-only `@builder.io/vite-plugin-jsx-loc` plugin was removed. Direct and compatibility-tested dependency upgrades were then applied: Express 5, Recharts 3, Streamdown 2, Vite 8, the Vite React plugin 6, Vitest 4, esbuild 0.28, Axios, tRPC, AWS SDK, Tailwind tooling, PostCSS, Drizzle ORM, and related audited dependencies.

Express 5 rejects anonymous wildcard route paths. The storage proxy now uses the named `/manus-storage/*key` wildcard and both SPA fallbacks use pathless middleware. A regression test verifies the storage route contract and empty-key response. Recharts 3 changed public tooltip and legend types; the custom chart wrapper now uses the Recharts 3 content-prop contracts.

## Final validation evidence

| Check                                             | Result                                                                                               |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `pnpm test`                                       | Passed — 9 test files and 19 tests                                                                   |
| `pnpm run check`                                  | Passed — TypeScript reported no errors                                                               |
| `pnpm run build`                                  | Passed — Vite 8 client and server bundles generated                                                  |
| `pnpm install --frozen-lockfile --ignore-scripts` | Passed — lockfile is current                                                                         |
| Express 5 development restart                     | Passed — server reports `Server running on http://localhost:3000/` without new wildcard route errors |
| `pnpm exec drizzle-kit --version` and `--help`    | Passed — stable database tooling is operational                                                      |

## Local security-audit result

The initial local audit reported 3 critical, 49 high, 77 moderate, and 11 low advisories. The final root production dependency graph reports **0 critical, 0 high, 0 moderate, and 0 low** advisories. The Firebase Functions migration package audit also reports **0 critical, 0 high, 0 moderate, and 0 low** advisories.

GitHub additionally evaluates development dependencies. Its remaining root esbuild alert is inherited from the latest stable `drizzle-kit@0.31.10` development-tooling chain. The available `drizzle-kit@1.0.0-rc.4` release candidate clears that alert but fails both `drizzle-kit --version` and `--help` against the project’s supported `drizzle-orm@0.45.2` with `ERR_PACKAGE_PATH_NOT_EXPORTED` for `drizzle-orm/_relations`. It was therefore rejected and the latest working stable Drizzle Kit was retained. This advisory is limited to local development tooling; it is not bundled into the deployed application. A future stable Drizzle Kit 1.0 release, paired with a controlled Drizzle ORM migration, is required for a safe final removal.

The production build still emits a bundle-size performance advisory. It is not a security, type, test, or startup failure; the resulting client bundle is smaller after the Vite 8 migration.

## Firebase Functions migration package

The unpublished Firebase Functions migration package was independently upgraded to `firebase-admin@14.2.0` and `firebase-functions@7.3.2`. Its Google Cloud Storage dependency chain retains UUID as an optional transitive dependency, so a package-scoped `pnpm-workspace.yaml` pins UUID to the security-fix release `11.1.1`.

| Check                            | Result                                                             |
| -------------------------------- | ------------------------------------------------------------------ |
| Functions frozen install         | Passed with ignored build scripts                                  |
| Functions TypeScript lint        | Passed                                                             |
| Functions TypeScript build       | Passed                                                             |
| Functions compiled-module import | Passed — no Firebase resources were called                         |
| Functions `pnpm audit`           | Passed — 0 critical, 0 high, 0 moderate, and 0 low vulnerabilities |

This package remains unpublished. The dependency work did not invoke Firebase CLI deployment, rules deployment, billing, data transfer, or any external outreach.

## External gates

Firebase Hosting publication remains blocked by the separate Firebase CLI owner-authentication flow. No billing linkage, Firebase Functions deployment, rules deployment, private-record transfer, or external outreach was attempted.

## GitHub readiness

The GitHub CLI is authenticated as `balajirajput96`. The private project repository is `https://github.com/balajirajput96/antigravity-pharma-dashboard`. The final tested remediation commit remains to be synchronized to that repository.

## GitHub Dependabot refresh

The owner-visible GitHub Dependabot refresh was requested after commit `9be26db`. GitHub reprocessed the current dependency files and reduced the repository from 119 open alerts to two open moderate alerts, with 140 alerts closed. The remaining alerts are:

| Alert                                    | Manifest                                      | Classification                                                                                                                                                     |
| ---------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| UUID buffer bounds check                 | `firebase-migration/functions/pnpm-lock.yaml` | Safe to remediate in the unpublished Firebase Functions migration package by updating its lockfile and rerunning its package validation.                           |
| esbuild development-server request issue | root `pnpm-lock.yaml`                         | Same stable Drizzle Kit transitive development-tool limitation described above; local audit and GitHub agree that the deployed application bundle is not affected. |

GitHub stated that the alert refresh may take several minutes to finish reflecting changes. After commit `eee287d` pushed the Firebase Functions UUID 11.1.1 lockfile override, the original UUID alert (`#1`) displayed **closed as fixed**. A later refresh identified a separate root-lockfile UUID alert (`#79`) alongside the root esbuild development-server alert (`#4`). Commit `6217d56` added the root UUID 11.1.1 override. The subsequent owner-visible refresh showed **1 open** and **141 closed** alerts: both UUID alerts are now closed, and only the development-scoped root esbuild alert remains. The root production audit and Firebase Functions audit are clean. A compatibility-tested transitive esbuild override will be evaluated before retaining the documented stable Drizzle Kit limitation.

The scoped override test targeted `@esbuild-kit/core-utils>esbuild` at `0.28.2`. It did not replace the package’s fixed `~0.18.20` dependency; `pnpm why esbuild@0.18.20` continued to resolve only through `drizzle-kit@0.31.10 → @esbuild-kit/esm-loader@2.6.5 → @esbuild-kit/core-utils@3.3.2`. Drizzle Kit version/help checks, the 19-test suite, TypeScript, production build, both frozen installs, and both production audits remained successful. The ineffective override was removed rather than left as misleading configuration. The final one-open-alert state therefore remains a stable upstream development-tool limitation pending a compatible stable Drizzle Kit release.

## Sources

- https://pnpm.io/10.x/settings
- https://pnpm.io/cli/audit

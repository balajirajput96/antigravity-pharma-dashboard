# Antigravity Pharma Workspace — Reviewed Integration Plan

## Objective

Bring the **Controlled Lab Ledger** visual language from the validated local rebuild into this full-stack workspace without removing authentication, owner protection, tRPC workflows, server-side safety gates, or the confirmed-send audit trail.

## Compatibility Decision

The local rebuild and this repository are not interchangeable application roots. The local rebuild is a static, intentionally local-only interface; this repository includes authenticated workspace data, a tRPC API, scheduled-workflow endpoints, and guarded confirmation flows.

For that reason, integration will preserve this repository’s application architecture and adapt the rebuilt interface as a **visual and information-architecture layer**. No Git history will be rewritten and no backend workflow, credential boundary, or scheduled job implementation will be removed.

| Area | Integration treatment |
|---|---|
| Authentication and owner access | Preserve existing `DashboardLayout`, login, logout, and owner-only error behaviour. |
| Workspace data | Preserve the `workspace.dashboard` query and existing loading, error, first-import, and polling handling. |
| Safety-gated actions | Preserve initialization, schedule activation, draft review, and explicit Confirm & Send mutations. |
| Ledger styling | Introduce only compatible warm-graphite, mineral-green, compact ledger typography, and accessible contrast tokens. |
| Deployment package | Add a Cloud Run-compatible Dockerfile and an explicit deployment guide; no deployment, billing, public access change, credential creation, or secret insertion is performed by this integration. |

## Verification Gate

Before a GitHub push, run the root TypeScript check, unit tests, production build, standalone Firebase Functions compilation, and Firebase Hosting TypeScript/Vite build. After push, verify the remote GitHub Actions result for the new commit.

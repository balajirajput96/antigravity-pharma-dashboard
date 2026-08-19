# Antigravity Pharma Workspace — Cloud Run Deployment Guide

This repository is an authenticated full-stack workspace managed on Manus hosting. No custom `Dockerfile` is retained because the application does not require an extra runtime or system binary, and a root Dockerfile would replace the managed deployment image without improving the supported hosting path.

## Verified pre-deployment state

| Item | Status |
|---|---|
| Root TypeScript check | Passed locally |
| Root unit tests | Passed locally |
| Root production build | Passed locally |
| Firebase Functions TypeScript compilation | Passed locally |
| Firebase Hosting TypeScript and Vite build | Passed locally |
| Google project under consideration | `gemini-api-project-504802` |
| Cloud Run deployment | Deferred; no deployment package is retained |

## Required decision before deployment

> A Cloud Run deployment can enable Google Cloud services, create a container build, establish a service, and incur usage charges. It may also require a decision about ingress and service access. Deployment must therefore be confirmed in the current conversation immediately before it is started.

Do not add API keys, OAuth secrets, service-account keys, or database credentials to the repository. If authenticated runtime integrations are needed after deployment, store them only in the platform’s secret-management facility and provide them through the deployment environment; never commit them to Git.

## Deferred Cloud Run research parameters

| Setting | Proposed value |
|---|---|
| Google Cloud project | `gemini-api-project-504802` |
| Cloud Run service | `antigravity-pharma-workspace` |
| Region | `asia-south1` (Mumbai) |
| Runtime port | `8080` |
| Ingress and IAM access | Decide explicitly during deployment; do not enable public access by default. |

## Migration boundary

The current production application remains on Manus hosting. A future Cloud Run migration would require a separately reviewed deployment design, including replacement or compatibility planning for Manus authentication, database connectivity, storage access, scheduled jobs, owner-only access control, and runtime secrets. Do not deploy this repository to Cloud Run or enable Google Cloud services from this guide.

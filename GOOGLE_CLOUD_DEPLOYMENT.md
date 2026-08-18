# Antigravity Pharma Workspace — Cloud Run Deployment Guide

This repository is an authenticated full-stack workspace. The included `Dockerfile` builds the Vite client and Express/tRPC server, then runs the server on the `PORT` provided by Cloud Run. The runtime entry point serves the compiled application and retains its API, authentication, storage-proxy, and safety-gated workflow routes.

## Verified pre-deployment state

| Item | Status |
|---|---|
| Root TypeScript check | Passed locally |
| Root unit tests | Passed locally |
| Root production build | Passed locally |
| Firebase Functions TypeScript compilation | Passed locally |
| Firebase Hosting TypeScript and Vite build | Passed locally |
| Google project under consideration | `gemini-api-project-504802` |
| Cloud Run deployment | Not started |

## Required decision before deployment

> A Cloud Run deployment can enable Google Cloud services, create a container build, establish a service, and incur usage charges. It may also require a decision about ingress and service access. Deployment must therefore be confirmed in the current conversation immediately before it is started.

Do not add API keys, OAuth secrets, service-account keys, or database credentials to the repository. If authenticated runtime integrations are needed after deployment, store them only in the platform’s secret-management facility and provide them through the deployment environment; never commit them to Git.

## Proposed deployment parameters

| Setting | Proposed value |
|---|---|
| Google Cloud project | `gemini-api-project-504802` |
| Cloud Run service | `antigravity-pharma-workspace` |
| Region | `asia-south1` (Mumbai) |
| Runtime port | `8080` |
| Ingress and IAM access | Decide explicitly during deployment; do not enable public access by default. |

## Command template

Run the following from the repository root only after confirming the target project, region, ingress, IAM access, and any required runtime configuration:

```bash
gcloud run deploy antigravity-pharma-workspace \
  --source . \
  --project gemini-api-project-504802 \
  --region asia-south1
```

The command template is documentation only. It does not deploy the service, modify billing, create credentials, or make the service public.

# Google AI Studio deployment research

## Initial official sources reviewed

| Source | Key point to verify in the deployment assessment |
|---|---|
| [Build apps in Google AI Studio](https://ai.google.dev/gemini-api/docs/aistudio-build-mode) | Google AI Studio Build Mode supports building and deploying applications, subject to its supported architecture and deployment requirements. |
| [Deploying from Google AI Studio](https://ai.google.dev/gemini-api/docs/aistudio-deploying) | Google AI Studio provides a direct deployment path for full-stack applications; its documented runtime, identity, database, and deployment constraints must be compared with the existing React/Express/tRPC/MySQL/Heartbeat dashboard. |

## Project compatibility questions

The existing dashboard relies on Manus OAuth owner enforcement, a MySQL/TiDB database, S3-backed workspace files, a built-in notification service, and a platform-managed daily scheduler. Before any migration or deployment is attempted, confirm whether the Google AI Studio deployment path can replace or safely connect each dependency without weakening the single-owner gate or confirmation-required outreach rule.

## Confirmed AI Studio route and account access

The intended Google account is already signed in to Google AI Studio Build Mode. The account can open the new-app workflow, which exposes a full-stack web-app path and an authentication/database option. Official documentation also states that existing code can be imported from GitHub and that deployment targets Cloud Run. The Starter Tier can deploy up to two full-stack services without a Cloud project or billing account, subject to Google eligibility and platform limits.

## Compatibility assessment

| Existing dependency | Directly portable to AI Studio | Required action |
|---|---|---|
| React client and Express/Node server | Potentially, after dependency and runtime validation | Import source and adapt build/runtime configuration if necessary. |
| Manus OAuth single-owner guard | No | Replace with Firebase Authentication and explicitly restrict the owner email. |
| MySQL/TiDB workspace data | No managed direct replacement in the current app | Migrate schema and records to Firestore, or configure another secure production database. |
| Manus S3 file helper | No | Use Firebase Storage or another approved storage provider. |
| Manus LLM, notification, and scheduler services | No | Replace with Gemini server-side calls, an appropriate notification provider, and a Google-compatible scheduled execution mechanism. |

The existing project should therefore be treated as a controlled migration, not a one-click direct deployment. A direct Cloud Run publish of the current source would retain references to Manus-only environment variables and services, so it would not meet the private-workspace requirements without refactoring.

## Approved record inventory

The current application database contains one workflow-settings record and no persisted runs, leads, drafts, workspace files, or delivery events. The approved local workspace contains one dated Hindi job-search report and one dated JSONL audit from 15 August 2026. The report records 24 audited leads, 5 historically verified-sent applications, 3 prepared but unsent drafts, 12 role-mismatch skips, and 4 duplicate skips.

The approved report and audit may contain candidate contact details, public resume URLs, and draft text. They must be imported only into a private owner-scoped data store, never embedded in client-side source, sample data, public build artifacts, or a shared showcase URL. The new app must require the owner’s verified Google account before any migrated record can be read.

## Google environment check

The authenticated Google account has an existing `gemini-api-project-504802` Cloud project selected in the local Google Cloud CLI. Firebase tooling is not installed locally, and no deployment or billing change has been made. The migration must continue through Google AI Studio Build Mode and use its Starter Tier only if Google shows the account as eligible; it must not switch to Standard Deployment or enable billing.

## AI Studio draft state

An unpublished AI Studio draft was created under the authenticated account at `https://aistudio.google.com/apps/b4eaaa0b-5ab5-4c40-9b28-480758aa51ae?showPreview=true&project=gen-lang-client-0619657382&showAssistant=true`. It received only the privacy-preserving build specification, not real reports, audits, drafts, contacts, or secrets. The initial code-generation attempt was canceled by Google AI Studio with “An internal error occurred.” No publication was attempted. The appropriate next recovery step is to retry a shorter, staged prompt from the existing unpublished draft rather than to publish or re-enter private content.

The staged retry encountered the same internal generation error. The user selected the recovery path to keep the validated Manus-hosted dashboard as the live primary workspace and preserve this unpublished AI Studio draft for a later manual or automated retry. No existing workspace record was migrated, and no external app was published.

## Primary live workspace verification

The retained production URL `https://antigravdash-o59hxjz4.manus.space/` is reachable and redirects unauthenticated visitors to the branded “Sign in to Antigravity Pharma Workspace” OAuth page. This confirms the live workspace keeps an authentication gate rather than exposing dashboard data publicly.

## Non-published Firebase migration package

The repository now contains a no-data `firebase-migration/` package that can be used when the unpublished AI Studio draft becomes usable. It includes deny-by-default Firestore and Storage rules, an owner-claim bootstrap callable function that reads `OWNER_EMAIL` only as a Firebase server secret, and an explicit `recordConfirmationHold` function with no email, Gmail, HTTP delivery, or web-form code. Its manifest accepts only report and audit migration kinds and explicitly disallows resumes, passwords, OTPs, Aadhaar, PAN, bank data, attachments, and unrelated private documents.

The package was validated locally without a Firebase project, credentials, records, or publication: the repository regression suite passed 13 tests, the root TypeScript check passed, and the Firebase Functions scaffold passed its own strict TypeScript lint step. The remaining external blocker is Google AI Studio’s repeated internal code-generation error; no technical package or private-data blocker remains for a later no-billing eligibility check and Firebase project setup.

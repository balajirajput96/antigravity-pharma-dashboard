# Google AI Studio deployment research

## Initial official sources reviewed

| Source                                                                                      | Key point to verify in the deployment assessment                                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Build apps in Google AI Studio](https://ai.google.dev/gemini-api/docs/aistudio-build-mode) | Google AI Studio Build Mode supports building and deploying applications, subject to its supported architecture and deployment requirements.                                                                                            |
| [Deploying from Google AI Studio](https://ai.google.dev/gemini-api/docs/aistudio-deploying) | Google AI Studio provides a direct deployment path for full-stack applications; its documented runtime, identity, database, and deployment constraints must be compared with the existing React/Express/tRPC/MySQL/Heartbeat dashboard. |

## Project compatibility questions

The existing dashboard relies on Manus OAuth owner enforcement, a MySQL/TiDB database, S3-backed workspace files, a built-in notification service, and a platform-managed daily scheduler. Before any migration or deployment is attempted, confirm whether the Google AI Studio deployment path can replace or safely connect each dependency without weakening the single-owner gate or confirmation-required outreach rule.

## Confirmed AI Studio route and account access

The intended Google account is already signed in to Google AI Studio Build Mode. The account can open the new-app workflow, which exposes a full-stack web-app path and an authentication/database option. Official documentation also states that existing code can be imported from GitHub and that deployment targets Cloud Run. The Starter Tier can deploy up to two full-stack services without a Cloud project or billing account, subject to Google eligibility and platform limits.

## Compatibility assessment

| Existing dependency                             | Directly portable to AI Studio                       | Required action                                                                                                                     |
| ----------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| React client and Express/Node server            | Potentially, after dependency and runtime validation | Import source and adapt build/runtime configuration if necessary.                                                                   |
| Manus OAuth single-owner guard                  | No                                                   | Replace with Firebase Authentication and explicitly restrict the owner email.                                                       |
| MySQL/TiDB workspace data                       | No managed direct replacement in the current app     | Migrate schema and records to Firestore, or configure another secure production database.                                           |
| Manus S3 file helper                            | No                                                   | Use Firebase Storage or another approved storage provider.                                                                          |
| Manus LLM, notification, and scheduler services | No                                                   | Replace with Gemini server-side calls, an appropriate notification provider, and a Google-compatible scheduled execution mechanism. |

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

## Firebase Starter Tier eligibility check

On 15 August 2026, the owner Google account successfully opened Firebase Console and the **Create a project** wizard. The account has no selected Firebase project in the console and is eligible to begin project creation; the wizard requires only a project name and acceptance of Firebase terms at this stage. No project name was entered, no terms were accepted, no project was created, and no billing or Google Cloud setting was changed. Final Spark/Starter Tier eligibility can only be confirmed on the next wizard step after the account terms are accepted, which would be an account-changing action and requires the owner’s explicit confirmation first.

The owner then explicitly approved deployment. Firebase terms were accepted and the intended private project display name `Antigravity Pharma Private` was entered. Firebase is still generating a unique project identifier; the **Continue** control remains disabled, so no project has been created and no billing setting has been shown or changed.

Two subsequent checks still showed the wizard in `Generating…` state with the identifier unavailable and **Continue** disabled. The wizard has therefore not reached a point where Spark/Starter selection, project creation, billing, rules, functions, data migration, or publication can occur.

The stalled new-project wizard was closed without creating any resource. The Firebase Console still presents **Add Firebase to Google Cloud project**, providing a separate read-only inspection path for the existing Google Cloud project. No terms were re-accepted in the reopened wizard and no existing project has been attached or altered.

The existing-project path opened a separate **Get started** screen with an empty Google Cloud project selector, a terms checkbox, and disabled **Continue**. It has not selected an existing project, attached Firebase, created a project, changed billing, or deployed anything.

The read-only project selector lists three existing Google Cloud projects: `My First Project`, `Gemini-API-Project`, and `Gemini Project`. None has been selected. Firebase attachment would require selecting one, accepting Firebase terms, and clicking **Continue**, which is an account-changing action and remains blocked pending explicit confirmation for a named project.

The owner selected the neutral `My First Project` route. Its verified project ID is `project-23447353-9f40-4f75-a8b` and Google Cloud reports `billingEnabled: false` with no attached billing account. The first Firebase Management API attachment attempt failed because the API required an explicit quota consumer; a second attempt supplied the verified project as `X-Goog-User-Project` and failed because the Firebase Management API is disabled for that project. No Firebase project attachment, billing change, data migration, secret configuration, or deployment occurred. The remaining prerequisite is to enable `firebase.googleapis.com` on the selected project, then retry attachment after API propagation.

Firebase is now attached to `project-23447353-9f40-4f75-a8b` after the owner completed the Firebase Console project-selection step. The verified Firebase project is `ACTIVE`, retains `billingEnabled: false`, and has a Firebase Hosting site identifier. However, the migration package’s server-side owner gate and confirmation-hold workflow require Cloud Functions. Official Firebase documentation states that Cloud Functions deployment requires the Blaze pricing plan, while the Spark plan does not expose Cloud Functions; enabling Blaze requires linking a Cloud Billing account. Therefore, the full private workflow cannot be safely deployed to Firebase while the user’s no-billing requirement remains in force. The existing owner-protected Manus deployment remains the only validated live version. See [Firebase pricing plans](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans) and [Cloud Functions deployment requirements](https://firebase.google.com/docs/functions/get-started).

On 15 August 2026, the signed-in account `balajirajputparuluniversity@gmail.com` was verified in Google Cloud Billing at `https://console.cloud.google.com/billing`. The console shows no existing billing accounts and presents only **Start free** / **Add billing account**. A billing account or Free Trial enrollment must be created manually by the owner before Blaze can be enabled; none is connected yet.

## Free-trial enrollment review

The Google Cloud free-trial enrollment page is open for the signed-in owner account, and the country is set to India at the user's request. The page describes a USD 300, 90-day trial credit and says that there are no automatic charges during the trial; a payment method may still be required during enrollment. No terms have been accepted, payment details entered, billing account created, project billing linked, or application published in this step.

The owner then directed the India enrollment to proceed. The Google Cloud free-trial terms step was accepted and the browser advanced to `https://console.cloud.google.com/freetrial/signup/billing/IN`. The payment-verification page is still loading. No payment, personal billing, billing-account, project-linkage, function-deployment, data-migration, or app-publication action has been performed.

## Antigravity CLI assessment and local recovery validation

Antigravity CLI 1.1.13 completed a read-only repository assessment with no cloud, billing, file-upload, or publication action. It confirmed that the no-data Firebase migration package is structurally ready: deny-by-default Firestore and Storage rules, owner-gated callable scaffolding, confirmation-hold logic with no delivery code, and approved import constraints. It also confirmed that Cloud Functions are the required server-side enforcement mechanism and cannot be deployed on Firebase Spark; the only complete Firebase path therefore requires an active Blaze billing account.

The remaining safe local validation was completed without credentials or cloud contact: all 13 repository regression tests passed, root TypeScript completed without errors, and the Firebase Functions scaffold completed strict TypeScript validation. The Firebase CLI is not installed locally; installing it would not unblock deployment before owner-managed payment verification and billing activation are complete. The current Manus-hosted private application remains the verified production workspace.

## Proposed Blaze cost safeguards

The repository now documents a non-binding, project-scoped budget safeguard plan in `firebase-migration/BILLING_SAFEGUARDS.md`. It targets only `project-23447353-9f40-4f75-a8b` (**My First Project**) and intentionally excludes all Gemini-related projects. Before any billing linkage, the documented proposal requires separate owner approval for a ₹1,000 monthly test budget, actual-spend alerts at 1%, 2%, 5%, 50%, 80%, and 100%, a 100% forecast alert, and a Functions spend cap at 90% of the owner-approved Functions allocation where supported. It also requires manual review after deployment and weekly while active.

This is a monitoring and shutdown-risk-reduction plan, not a charge guarantee: official Firebase documentation states that budgets and budget alerts do not cap charges, reporting can be delayed, and supported spend caps are not instantaneous hard caps. The plan therefore keeps private-data migration disabled until the owner-only rules and initial budget review are complete. See [Avoid surprise bills](https://firebase.google.com/docs/projects/billing/avoid-surprise-bills) and [Firebase pricing plans](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans).

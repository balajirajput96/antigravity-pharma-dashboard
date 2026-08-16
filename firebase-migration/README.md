# Firebase Migration Package — Antigravity Pharma Workspace

This folder is a **non-published, no-data migration package** for the later Google AI Studio/Firebase version of the private Antigravity Pharma Workspace. It contains security rules, server-side callable-function scaffolding, an import manifest template, and Firebase project placeholders. It contains **no report text, JSONL entries, contact details, credentials, personal documents, or owner email**.

## Security model

The deployed Firebase project must define the `OWNER_EMAIL` secret only on the server. `ownerBootstrap` compares the signed-in Google account email with that secret and sets the server-managed `privateWorkspaceOwner` custom claim. Firestore and Storage rules require both that claim and the matching owner UID path. A browser cannot set this claim.

All private data must live beneath `owners/{ownerUid}/...`. The rules deny every other path and every user without the server-issued claim. The client Firebase configuration may be public; Firebase Admin credentials and `OWNER_EMAIL` must never be bundled into the browser.

## Safe migration sequence

1. Create a new Firebase project only after confirming a no-billing-compatible setup is available.
2. Copy `.firebaserc.example` to `.firebaserc` and replace only `YOUR_FIREBASE_PROJECT_ID`.
3. In `hosting/`, obtain only the public Firebase web configuration listed in `FIREBASE_WEB_CONFIG.md` and provide it through the selected deployment environment. The build intentionally refuses to operate without it.
4. Install dependencies in `functions/` and `hosting/`. Deploy Firestore/Storage rules, Hosting, and callable functions, then set the server secret with the Firebase CLI. Do **not** put `OWNER_EMAIL` in source or `.env` files.
5. Sign in with the owner Google account and call `ownerBootstrap` once to obtain the server-managed owner claim. The Hosting client cannot read data until that server-side check succeeds.
6. Use the owner-only import UI or a reviewed server-side tool to transfer only approved Hindi reports and JSONL audits. Never import resumes, passwords, OTPs, Aadhaar, PAN, bank information, attachments, or unrelated private documents.
7. Keep the existing Manus-hosted workspace as the primary app until Firebase migration validation is complete. This package does not create a scheduler, connect Gmail, or send outreach.

## Confirmation gate

`recordConfirmationHold` intentionally writes a `confirmation-held` delivery event and returns `delivery: "not-sent"`. It has no mail, Gmail, HTTP, web-form, or submission integration. A separate audited provider integration and another explicit owner confirmation would be required before any real delivery capability is ever introduced.

## Manual import manifest

Use `migration-manifest.example.json` only as a field-level mapping guide. It is not data and must not be populated with private values in a browser prompt or public repository.

## Free Firebase Hosting placeholder

`firebase.json` currently publishes only `free-hosting/public` when deployed with `firebase deploy --only hosting`. This is a deliberately static, public placeholder with **no Firebase configuration, authentication, Firestore, Storage, Functions, job-search automation, report content, JSONL audits, drafts, contacts, forms, or outreach capability**. It does not migrate or expose any private workspace record.

To publish this free placeholder, the owner must complete the Firebase CLI Google sign-in in a browser. This is an account authorization step, not a billing step. After the CLI is authenticated, the explicitly owner-approved command is `firebase deploy --only hosting --project PROJECT_ID`. No Firestore rules, Storage rules, Functions, owner secret, or private-data import is included in that command.

The full owner-only Firebase client remains under `hosting/` together with the Firestore, Storage, and callable Functions package. It is retained for a later migration only after the owner independently completes billing setup, explicitly approves a Blaze deployment, configures the `OWNER_EMAIL` server secret, and separately authorizes any private-data transfer. Until then, the Manus-hosted workspace remains the sole functional private dashboard.

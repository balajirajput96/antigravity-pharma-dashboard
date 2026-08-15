# Antigravity Pharma Workspace — Google AI Studio Build Specification

Build a **private, single-owner full-stack web application** named **Antigravity Pharma Workspace**. It is a personal pharmaceutical QA/IPQA/QMS/OSD job-search workspace. It must use a React frontend, a secure Node.js server runtime, Firebase Authentication, Firestore, and Firebase Storage. Do not expose any real user data in seed data, source code, browser bundles, screenshots, or public URLs.

## Owner-only access

Use Google sign-in. The server must read an `OWNER_EMAIL` server-side secret and grant access only when the authenticated Google email equals that secret. Do not hardcode the email in browser code. Any other signed-in user must see an access-denied state and receive no workspace data. Firestore documents must be scoped under the owner UID, and Firestore/Storage rules must prevent any other UID from reading or writing them.

## Private collections and files

Create private owner-scoped records for `settings`, `runs`, `leads`, `drafts`, `workspaceFiles`, and `deliveryEvents`. Store generated Hindi reports and JSONL audit logs in private Firebase Storage paths. The UI should support a one-time owner-only migration/import screen that can import an approved Hindi report and JSONL audit file into the private data model. Do not import resumes, passwords, OTPs, Aadhaar, PAN, bank data, attachments, or other sensitive documents.

## Required workflow safeguards

The safety panel must remain visible at all times. Use these exact lead/draft labels: `Prepared`, `Verified-Sent`, `Skipped-Role mismatch`, and `Skipped-Duplicate`.

The application may research publicly available jobs, analyze role fit, prevent duplicate contacts, generate Hindi reports, generate JSONL audits, and prepare outreach drafts. It must **never** send email, submit a web form, create an account, or connect Gmail automatically. A draft can only move beyond `Prepared` after the owner explicitly presses a clear **Confirm & Send** control. When no configured delivery provider exists, the server must record the confirmation hold and send nothing. Never add an automatic sending pathway.

## UI and user experience

Adapt the current dashboard’s calm green private-workspace style. Include an always-visible safety panel, run metrics, a draft review area, workspace-file viewer, import progress animation, and success toast after the first verified import. Use loading, empty, error, and access-denied states. Keep the UI responsive on desktop and mobile.

## Scheduling and integrations

Show a 10:00 AM IST daily-search schedule status, but **do not provision or claim a Google scheduler** unless a supported no-billing configuration is explicitly available. Do not connect Gmail or any external delivery service. Provide a protected configuration area that can later accept an approved, server-side schedule or delivery integration without exposing secrets.

## Quality requirements

Create unit tests for owner access denial, exact status labels, duplicate suppression, confirmation gating, and first-import feedback eligibility. Use server-side secrets, strict Firestore/Storage rules, and no client-side privileged credentials. Do not publish the application yet.

# Antigravity Pharma Daily Research Workspace

This workspace is exclusively for Balaji Rajput’s daily pharmaceutical job-market research. Operate only within `/home/ubuntu/agy_pharma_job_task/`.

## Mandatory pre-research recovery and validation

Before research, check that this workspace’s `GEMINI.md`, `gemini_pharma_safety.toml`, `package.json`, and `validate_safety_policy.sh` files exist and that `/home/ubuntu/gemini_pharma` is present. If any of these non-secret safety files or the launcher is missing after a sandbox reset, run only `/home/ubuntu/antigravity-pharma-dashboard/automation/restore-gemini-workspace.sh`, then return to `/home/ubuntu/agy_pharma_job_task/`.

If the workspace-local Gemini CLI binary is missing, run `pnpm install` only in `/home/ubuntu/agy_pharma_job_task/`. Before every research run, execute `pnpm run validate-safety`. If that validation fails, or existing Gemini authentication is unavailable, stop and report the blocked condition. Do not open, start, or guide any login flow.

After the preflight passes, start the configured local workflow only through `/home/ubuntu/gemini_pharma` from this workspace. Give it only the public-research task and this workspace’s safety instructions. Do not use any other workspace or process private files.

## Permitted daily scope

Research current **public** entry-to-mid-level pharmaceutical vacancies relevant to QA, IPQA, QMS, OSD, and adjacent quality roles. For every candidate posting, verify the posting freshness, employer identity, role fit, public contact evidence, and historical duplicate records before producing outputs.

Create only the following dated local artifacts in this workspace:

1. A Hindi research report in Markdown.
2. A JSONL audit that records public-source evidence, freshness checks, fit outcome, and duplicate outcome.
3. Truthful outreach drafts, clearly labelled **Prepared** and kept unsent.

Use only public job information and public contact evidence. A missing public contact method is a reason to record the limitation, not to search private sources or infer an address.

## Mandatory stop conditions

Never send an email, message, or notification. Never submit a form, apply for a role, create an account, log in to a third-party site, or bypass a CAPTCHA. Never use, request, store, copy, or disclose passwords, OTPs, Aadhaar, PAN, bank details, salary information, gender, native-place, identity documents, attachments, or any other private data.

Stop after the report, audit, and unsent-draft stage. Explicitly state that **no external action was taken** and that direct user confirmation is required before any outreach or submission.

## Output status vocabulary

Use these exact status labels: **Prepared**, **Verified-Sent**, **Skipped-Role mismatch**, and **Skipped-Duplicate**. This workflow may create only **Prepared**, **Skipped-Role mismatch**, or **Skipped-Duplicate** records. **Verified-Sent** must never be created by the daily automation.

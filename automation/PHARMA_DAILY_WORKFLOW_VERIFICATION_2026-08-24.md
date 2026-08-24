# Daily Pharma Workflow — Read-Only Verification (24 August 2026)

## Scope

This record verifies the configured task-level daily pharmaceutical job-research workflow without launching research, checking authentication, opening a login flow, or taking any external action. It is separate from the private Hindi reels workflow.

## Schedule and Workspace

| Control | Verified state |
|---|---|
| Task | `Daily Pharma QA/IPQA Job Search` (`febHBhDzaeRYck52jUo2TI`) |
| Schedule | Active; `0 0 10 * * *` in `Asia/Kolkata` |
| Latest execution entry observed | `2026-08-24T04:31:50.470Z` |
| Dedicated workspace | `/home/ubuntu/agy_pharma_job_task/` present |
| Non-secret recovery boundary | `automation/restore-gemini-workspace.sh` remains the only permitted reset recovery path |
| Launcher boundary | `/home/ubuntu/gemini_pharma` present; not invoked in this verification |

## Mandatory Preflight

`pnpm run validate-safety` was run only inside `/home/ubuntu/agy_pharma_job_task/` and passed. The verification did **not** probe existing Gemini authentication, attempt a login, use credentials, open a browser, start the launcher, or run research.

> **Fail-closed condition:** If future scheduled execution lacks valid safety files, preflight, or existing Gemini authentication, it must stop and report the blocked condition. It must not open a login, use a password, request or use OTP/CAPTCHA, or bypass access controls.

## Allowed Scheduled Workflow Output

If the preflight and existing authentication conditions are met, the dedicated workspace instructions limit the daily workflow to public QA/IPQA/QMS/OSD and related entry-to-mid-level vacancy research; freshness, employer, role-fit, public-contact evidence, and historical-duplicate checks; then a dated Hindi report, JSONL audit, and truthful **Prepared** outreach drafts only.

## Explicit Prohibitions and Result

The workflow may not send emails or messages, submit forms, create accounts, attach sensitive documents, or process/share Aadhaar, PAN, bank, salary, gender, native-place, or other private data. Any outreach or submission requires direct user confirmation after the report/draft stage.

No manual research, authentication action, login, outreach, submission, schedule modification, private-data action, or reels change occurred during this verification. A schedule execution timestamp is not treated as independent proof of a research result or external action.

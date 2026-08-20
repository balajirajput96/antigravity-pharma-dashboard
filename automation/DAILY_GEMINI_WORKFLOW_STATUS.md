# Daily Gemini Research Workflow — Operational Status

## Approved schedule design and current persisted state

The approved scheduled-task design is named **Daily Pharma QA IPQA Job Search** and is intended to run at **10:00 AM Asia/Kolkata** every day, working only in `/home/ubuntu/agy_pharma_job_task/`. Its instruction payload is research-only: it may investigate current public QA, IPQA, QMS, OSD, and related entry-to-mid-level vacancies; verify freshness, employer, role fit, public contact evidence, and historical duplicates; then prepare a dated Hindi report, JSONL audit, and truthful unsent drafts.

As of 20 August 2026, the persisted owner workflow setting is **not activated** (`scheduleEnabled = false` and no scheduled-task identifier is stored). The dashboard therefore correctly displays the owner-only activation control. An owner must complete Manus authentication and activate this exact approved configuration before it can be described as active or execute.

The schedule may not send emails or messages, submit forms, create accounts, use passwords, OTPs, or CAPTCHAs, handle private or sensitive data, attach documents, or take any action after the report-and-draft stage. It must state that **no external action was taken** and request direct confirmation before any outreach or submission.

## Reset recovery

The durable, non-secret template is stored in `automation/gemini-workspace-template/`. After a sandbox reset, restore it with:

```bash
cd /home/ubuntu/antigravity-pharma-dashboard
chmod 700 automation/restore-gemini-workspace.sh
automation/restore-gemini-workspace.sh
cd /home/ubuntu/agy_pharma_job_task
pnpm install
pnpm run validate-safety
```

The restore process never writes an API key, Google credential, password, OTP, or private document. The owner must independently complete Gemini CLI authentication in Google’s browser flow before the CLI can perform research. Authentication may need to be repeated after a sandbox reset because credentials are intentionally not preserved in the project source.

## Completion boundary

The only allowed outputs are local dated Markdown reports, local JSONL audit entries, and locally stored truthful drafts labelled **Prepared**. A record labelled **Verified-Sent** can never be created by this scheduled workflow.

## Latest policy reconciliation

On 18 August 2026, the approved `Daily Pharma QA IPQA Job Search` configuration and both non-secret `GEMINI.md` copies were compared with the approved 10:00 AM IST instruction. The approved prompt matched its full wording. Both `GEMINI.md` copies were then expanded to explicitly require the non-secret reset-recovery path, a workspace-only `pnpm install` fallback, mandatory `pnpm run validate-safety`, a no-login blocked-condition rule when existing authentication is unavailable, and launcher-only workflow startup through `/home/ubuntu/gemini_pharma`.

After the update, `pnpm run validate-safety`, the 19-test dashboard regression suite, and `pnpm exec tsc --noEmit` completed successfully. The workspace-local Gemini CLI binary is installed, but no existing local authentication artifact is available in this sandbox. Once activated, a scheduled run must therefore stop and report that blocked condition without opening any login flow or attempting external action.

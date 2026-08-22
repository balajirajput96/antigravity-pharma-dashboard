# Daily Gemini Research Workflow — Operational Status

## Approved schedule design and two distinct current states

The approved scheduled-task design is named **Daily Pharma QA IPQA Job Search** and is intended to run at **10:00 AM Asia/Kolkata** every day, working only in `/home/ubuntu/agy_pharma_job_task/`. Its instruction payload is research-only: it may investigate current public QA, IPQA, QMS, OSD, and related entry-to-mid-level vacancies; verify freshness, employer, role fit, public contact evidence, and historical duplicates; then prepare a dated Hindi report, JSONL audit, and truthful unsent drafts.

At initial verification on 20 August 2026, the current Manus-task schedule named **Daily Pharma QA IPQA Job Search** was independently verified as **active** at 10:00 AM Asia/Kolkata (`taskUid = febHBhDzaeRYck52jUo2TI`). It is a daily, research-only task schedule and is distinct from the dashboard’s owner workflow database record.

The persisted dashboard owner workflow setting remains **not activated** (`scheduleEnabled = false` and no dashboard-owned scheduled-task identifier is stored). The dashboard therefore correctly displays its owner-only activation control. An owner must complete Manus authentication and activate that protected dashboard control before the **dashboard-owned Heartbeat schedule** can be described as active. The active task-level schedule must not be misrepresented as a dashboard-owned schedule or as confirmation that the local Gemini environment is authenticated.

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

After the update, `pnpm run validate-safety`, the 19-test dashboard regression suite, and `pnpm exec tsc --noEmit` completed successfully. The Gemini CLI is workspace-local rather than available on the system PATH, and no existing local authentication artifact is available in this sandbox. Any scheduled run must therefore stop and report that blocked condition without opening any login flow or attempting external action.

## Latest non-interactive verification

On 21 August 2026, the supported schedule-status command reported the **Daily Pharma QA IPQA Job Search** task as active at 10:00 AM Asia/Kolkata (`taskUid = febHBhDzaeRYck52jUo2TI`) with its required research-only instruction payload and a latest recorded execution at 04:35:31 UTC. The required non-secret workspace files, `/home/ubuntu/gemini_pharma` launcher, and workspace-local Gemini CLI were present; the launcher reported CLI version `0.55.1`, and `pnpm run validate-safety` passed.

This verification did not start the Gemini research workflow, probe or open authentication, perform outreach, submit forms, or access private data. A schedule execution timestamp does not itself prove local Gemini authentication; the no-login stop condition remains mandatory whenever authentication is unavailable.

## Latest repeated verification

On 22 August 2026, the supported schedule inventory again reported the task as **active** at 10:00 AM Asia/Kolkata with the complete approved research-only instruction payload. Its latest recorded execution was 2026-08-22T04:30:17.133Z. The non-secret `GEMINI.md` and safety TOML, the `/home/ubuntu/gemini_pharma` launcher, and the workspace-local Gemini CLI were present; `pnpm run validate-safety` again passed.

No Gemini research, authentication check, login flow, message, email, form submission, account creation, document attachment, private-data handling, or other external action was initiated by this verification. The scheduled workflow must remain blocked and report the condition whenever existing Gemini authentication is unavailable.

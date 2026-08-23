# Daily Pharma Workflow Verification — 2026-08-23

## Scope

This is a **read-only compliance verification** of the existing task-level pharmaceutical job-research workflow. It does not start Gemini research, inspect authentication, open a login flow, send outreach, submit a form, or alter a schedule.

## Verified schedule facts

| Field | Observed value |
|---|---|
| Task name | Daily Pharma QA IPQA Job Search |
| Task ID | `febHBhDzaeRYck52jUo2TI` |
| Status | Active |
| Cron expression | `0 0 10 * * *` |
| Timezone | `Asia/Kolkata` |
| Run mode | `full_auto` as a new-task-disabled task schedule |
| Latest recorded execution | `2026-08-23T04:32:49.419Z` |

## Workspace and preflight checks

The dedicated `/home/ubuntu/agy_pharma_job_task/` workspace, its local safety instructions, and `/home/ubuntu/gemini_pharma` launcher were present. The required preflight was run from the dedicated workspace:

```text
pnpm run validate-safety
Gemini research-only safety policy validated.
```

No restore was necessary. The recovery rule remains: if the workspace safety files or launcher are missing after a reset, use only `/home/ubuntu/antigravity-pharma-dashboard/automation/restore-gemini-workspace.sh`, return to the dedicated workspace, and never restore or store credentials.

## Mandatory execution boundary

> If either the safety preflight or existing Gemini authentication is unavailable, the scheduled task must stop and report the blocked state without opening a login flow.

Any successful daily run is constrained to public-role research, freshness/employer/fit/public-contact/duplicate checks, a dated Hindi report, JSONL audit, and truthful prepared drafts. It must stop before email, messaging, applications, accounts, forms, sensitive-document handling, or any collection/sharing of private data. Direct user confirmation is required for each external outreach or submission.

## Isolation confirmation

The separate Hindi research-reels pipeline was not opened, edited, scheduled, or otherwise affected by this verification. No external action occurred.

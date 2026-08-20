# Continuation Framework — 20 August 2026

## Purpose and Scope

This record preserves the **legitimately accessible** execution environment for future maintenance. It is intentionally non-secret and does not copy credentials, session data, authentication artifacts, private documents, or user data. It is a maintenance framework, not an instruction to bypass owner authentication, safety validation, or outreach confirmation.

## Verified Project Surface

| Surface | Current status | Verified boundary |
|---|---|---|
| Private dashboard | Available and rendering | Owner-only backend procedures remain required for workspace and sending actions. |
| Source validation | Passing | Frozen install, TypeScript, 19 Vitest tests, production build, and production dependency audit pass. |
| Private GitHub | Available | `verify.yml` runs locked install, type-check, and unit tests. Recent relevant Verify runs pass. |
| Built-in project facilities | Declared and used | OAuth, database, LLM, storage, and Heartbeat are used through the project template. |
| Optional analytics | Available but fail-closed | Client analytics loads only when both configured HTTP(S) values exist; dashboard startup is unaffected otherwise. |
| Gemini workspace | Present | `/home/ubuntu/agy_pharma_job_task/`, local CLI, workspace safety policy, and `/home/ubuntu/gemini_pharma` launcher exist. |
| Daily research policy | Validated | The local safety preflight passes and blocks external outreach, forms, private data, credentials, and login-flow initiation. |

## Known Boundaries and Blocked Conditions

The browser preview can produce an expected `Please login (10001)` response when viewed without the owner’s Manus session. This is an access-control result, not an application exception. The dashboard’s daily-schedule database record is currently inactive and has no stored task identifier, so creating or activating that owner-protected schedule requires an authenticated owner session. The local Gemini workspace has no confirmed existing authentication artifact; therefore a research run must stop and report the blocked condition without opening a login flow.

No project code declares a Datadog integration, Google Cloud Run deployment client, Antigravity CLI integration, Gmail delivery integration, or self-hosted runner. These systems are not treated as failures and are not created merely to satisfy a broad audit request.

## Safe Continuation Control

> The current approved autonomous boundary is limited to **non-interactive validation and documentation maintenance**. It cannot create accounts, submit forms, send outreach, spend money, activate billing, expose private data, or bypass owner authentication.

The requested 2,400-hour, hourly continuation must **not** be created yet. The existing desired daily workflow depends on an owner-protected schedule and a local Gemini CLI workspace whose authentication is explicitly fail-closed. A safe durable schedule requires all of the following before activation:

1. The owner signs in through the already-open owner authentication flow.
2. The app creates and persists the intended daily 10:00 AM Asia/Kolkata task identifier through its protected control.
3. The authorized scheduler supports the proposed cadence and has a documented execution context that does not rely on an ephemeral local sandbox workspace.
4. The scheduled operation remains research/report/draft-only and stops when validation or existing authentication is unavailable.
5. Any billing, runner, plan, or external-service activation receives separate explicit approval.

## Repeatable Maintenance Sequence

Run only safe, non-interactive validation until the preceding requirements are satisfied:

```text
cd /home/ubuntu/antigravity-pharma-dashboard
pnpm install --frozen-lockfile
pnpm check
pnpm test --run
pnpm build
pnpm audit --prod

cd /home/ubuntu/agy_pharma_job_task
pnpm run validate-safety
```

If the workspace safety files or launcher are missing after reset, restore only the approved non-secret template with `/home/ubuntu/antigravity-pharma-dashboard/automation/restore-gemini-workspace.sh`, then repeat the local preflight. Never open a login flow from this sequence.

## Current Outcome

The repository and safe local controls are validated. The next legitimate operational step is **owner sign-in** to activate and persist the already designed daily schedule. Until then, the correct behavior is to preserve the research-only policy and report the authentication/schedule block rather than emulate or bypass it.

import { and, desc, eq, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import { sql } from "drizzle-orm";
import {
  deliveryEvents,
  jobLeads,
  jobRuns,
  outreachDrafts,
  workflowSettings,
  workspaceFiles,
} from "../drizzle/schema";
import { CANDIDATE_PROFILE, type IngestedLead, type LeadStatus } from "../shared/workflow";
import { getDb } from "./db";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";
import { storagePut } from "./storage";

const statusSet = new Set<LeadStatus>([
  "Prepared",
  "Verified-Sent",
  "Skipped-Role mismatch",
  "Skipped-Duplicate",
]);

export const DAILY_AGENT_INSTRUCTIONS = `Every day at 10:00 IST, use the saved Antigravity pharma workspace and Balaji Rajput's approved resume/profile to find current public pharmaceutical QA, IPQA, QMS, OSD, and related entry-to-mid-level vacancies. Verify posting date, employer, role fit, public contact evidence, and duplicate history. Do not send emails, submit forms, create accounts, use passwords or OTPs, attach sensitive documents, or share Aadhaar, PAN, bank, salary, gender, native-place, or other private data. Prepare structured raw leads and call the private app's scheduled ingestion endpoint. The app will generate Hindi reports, JSONL audit records, and truthful outreach drafts. Stop at the draft/report stage.`;

type FitResult = {
  status: LeadStatus;
  roleFit: string;
  eligibilityNotes: string;
  subject?: string;
  body?: string;
};

function asInsertId(result: unknown) {
  const first = Array.isArray(result) ? result[0] : result;
  return Number((first as { insertId?: number })?.insertId ?? 0);
}

function normalizeStatus(status?: string): LeadStatus {
  return status && statusSet.has(status as LeadStatus) ? (status as LeadStatus) : "Prepared";
}

function normalizedEmployer(value: string) {
  return value
    .toLowerCase()
    .replace(/\b(private|pvt|limited|ltd|llp|inc|incorporated|co|company)\b/g, "")
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 80);
}

async function analyzeWithLlm(lead: IngestedLead, duplicate: boolean): Promise<FitResult> {
  if (duplicate) {
    return { status: "Skipped-Duplicate", roleFit: "Historical audit contains an employer already contacted or reviewed.", eligibilityNotes: "Skipped to prevent duplicate outreach." };
  }

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a strict pharmaceutical recruitment analyst. Candidate: ${JSON.stringify(CANDIDATE_PROFILE)}. Use only vacancy text supplied. Never invent qualifications, experience, posting dates, employers, contact information, or claims. Return JSON only. A valid prepared draft must be brief, truthful, and must not include attachments or sensitive personal data.`,
      },
      {
        role: "user",
        content: JSON.stringify({
          employer: lead.employer,
          roleTitle: lead.roleTitle,
          postingDate: lead.postingDate,
          location: lead.location,
          publicContactEmail: lead.publicContactEmail,
          publicContactEvidence: lead.publicContactEvidence,
          vacancyText: lead.vacancyText,
        }),
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "pharma_vacancy_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            status: { type: "string", enum: ["Prepared", "Skipped-Role mismatch"] },
            roleFit: { type: "string" },
            eligibilityNotes: { type: "string" },
            subject: { type: "string" },
            body: { type: "string" },
          },
          required: ["status", "roleFit", "eligibilityNotes", "subject", "body"],
          additionalProperties: false,
        },
      },
    },
  });
  const content = response.choices[0]?.message?.content;
  if (typeof content !== "string") throw new Error("LLM returned an empty job analysis response");
  const parsed = JSON.parse(content) as FitResult;
  return {
    status: parsed.status === "Prepared" ? "Prepared" : "Skipped-Role mismatch",
    roleFit: parsed.roleFit,
    eligibilityNotes: parsed.eligibilityNotes,
    subject: parsed.subject,
    body: parsed.body,
  };
}

function buildReport(runDate: string, records: Array<{ employer: string; roleTitle: string; status: string; roleFit: string | null; eligibilityNotes: string | null; sourceUrl: string }>) {
  const counts = records.reduce<Record<string, number>>((acc, record) => {
    acc[record.status] = (acc[record.status] ?? 0) + 1;
    return acc;
  }, {});
  const rows = records.map((record, index) => `| ${index + 1} | ${record.employer} | ${record.roleTitle} | ${record.status} | ${record.roleFit ?? "—"} | [Source](${record.sourceUrl}) |`).join("\n");
  return `# Pharma Job Search Report — ${runDate}\n\n**Owner:** Balaji Rajput  \n**Scope:** Public QA, IPQA, QMS, OSD, and related entry-to-mid-level pharmaceutical vacancies.\n\n| Status | Count |\n|---|---:|\n| Prepared | ${counts.Prepared ?? 0} |\n| Verified-Sent | ${counts["Verified-Sent"] ?? 0} |\n| Skipped-Role mismatch | ${counts["Skipped-Role mismatch"] ?? 0} |\n| Skipped-Duplicate | ${counts["Skipped-Duplicate"] ?? 0} |\n\n## Audited Leads\n\n| # | Employer | Role | Status | Role fit / note | Public source |\n|---:|---|---|---|---|---|\n${rows || "| — | No verified leads were ingested in this run. | — | — | — | — |"}\n\n> Safety gate: no outreach has been sent automatically. Prepared items require Balaji Rajput's explicit Confirm & Send action.\n`;
}

function buildAudit(runDate: string, records: Array<{ employer: string; roleTitle: string; status: string; sourceUrl: string; publicContactEmail: string | null; roleFit: string | null; eligibilityNotes: string | null }>) {
  return records.map(record => JSON.stringify({ runDate, ...record, generatedBy: "Antigravity Pharma Workspace", outreach: "confirmation-required" })).join("\n") + (records.length ? "\n" : "");
}

export async function ensureWorkflowSettings(ownerOpenId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const existing = await db.select().from(workflowSettings).where(eq(workflowSettings.ownerOpenId, ownerOpenId)).limit(1);
  if (existing[0]) return existing[0];
  await db.insert(workflowSettings).values({ ownerOpenId, candidateProfile: JSON.stringify(CANDIDATE_PROFILE) });
  const created = await db.select().from(workflowSettings).where(eq(workflowSettings.ownerOpenId, ownerOpenId)).limit(1);
  if (!created[0]) throw new Error("Unable to create workflow settings");
  return created[0];
}

export async function listDashboard(ownerOpenId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const runs = await db.select().from(jobRuns).where(eq(jobRuns.ownerOpenId, ownerOpenId)).orderBy(desc(jobRuns.startedAt)).limit(8);
  const latest = runs[0] ?? null;
  const settings = await ensureWorkflowSettings(ownerOpenId);
  const files = await db.select().from(workspaceFiles).where(eq(workspaceFiles.ownerOpenId, ownerOpenId)).orderBy(desc(workspaceFiles.createdAt)).limit(20);
  const drafts = await db.select({ draft: outreachDrafts, lead: jobLeads })
    .from(outreachDrafts)
    .innerJoin(jobLeads, eq(outreachDrafts.leadId, jobLeads.id))
    .where(eq(outreachDrafts.status, "Prepared"))
    .orderBy(desc(outreachDrafts.createdAt));
  const recentLeads = latest ? await db.select().from(jobLeads).where(eq(jobLeads.runId, latest.id)).orderBy(desc(jobLeads.id)).limit(12) : [];
  return {
    settings,
    latest,
    runs,
    files,
    drafts,
    recentLeads,
    deliveryConfigured: Boolean(process.env.OUTBOUND_EMAIL_WEBHOOK_URL),
  };
}

export async function createInstructionFile(ownerOpenId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const filename = "daily-antigravity-pharma-instructions.md";
  const stored = await storagePut(`${ownerOpenId}/instructions/${filename}`, DAILY_AGENT_INSTRUCTIONS, "text/markdown");
  await db.insert(workspaceFiles).values({ ownerOpenId, kind: "instruction", filename, storageKey: stored.key, storageUrl: stored.url, mimeType: "text/markdown" });
  const [file] = await db.select().from(workspaceFiles).where(and(eq(workspaceFiles.ownerOpenId, ownerOpenId), eq(workspaceFiles.storageKey, stored.key))).limit(1);
  if (!file) throw new Error("Instruction file was not persisted");
  await db.update(workflowSettings).set({ agentInstructionFileId: file.id }).where(eq(workflowSettings.ownerOpenId, ownerOpenId));
  return file;
}

export async function ingestJobRun(ownerOpenId: string, rawLeads: IngestedLead[], runMode: "scheduled" | "manual-import" = "scheduled") {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
  const runKey = `${today}-${nanoid(10)}`;
  await db.insert(jobRuns).values({ ownerOpenId, runKey, runDate: today, runMode, status: "running" });
  const [run] = await db.select().from(jobRuns).where(and(eq(jobRuns.ownerOpenId, ownerOpenId), eq(jobRuns.runKey, runKey))).limit(1);
  if (!run) throw new Error("Run was not created");

  const historical = await db.select({ employer: jobLeads.employer }).from(jobLeads).innerJoin(jobRuns, eq(jobLeads.runId, jobRuns.id)).where(eq(jobRuns.ownerOpenId, ownerOpenId));
  const employers = new Set(historical.map(item => normalizedEmployer(item.employer)));
  const createdLeads: Array<typeof jobLeads.$inferSelect> = [];

  for (const raw of rawLeads.slice(0, 30)) {
    const duplicate = employers.has(normalizedEmployer(raw.employer));
    let analysis: FitResult;
    try {
      analysis = raw.status ? { status: normalizeStatus(raw.status), roleFit: raw.roleFit ?? "Imported public-vacancy review.", eligibilityNotes: raw.eligibilityNotes ?? "", subject: raw.draftSubject, body: raw.draftBody } : await analyzeWithLlm(raw, duplicate);
    } catch (error) {
      analysis = { status: "Skipped-Role mismatch", roleFit: "Analysis could not safely verify fit.", eligibilityNotes: String(error) };
    }
    const insertion = await db.insert(jobLeads).values({
      runId: run.id,
      employer: raw.employer,
      roleTitle: raw.roleTitle,
      location: raw.location ?? null,
      postingDate: raw.postingDate ?? null,
      sourceUrl: raw.sourceUrl,
      publicContactEmail: raw.publicContactEmail ?? null,
      publicContactEvidence: raw.publicContactEvidence ?? null,
      vacancyText: raw.vacancyText,
      roleFit: analysis.roleFit,
      eligibilityNotes: analysis.eligibilityNotes,
      status: analysis.status,
    });
    const leadId = asInsertId(insertion);
    const [lead] = await db.select().from(jobLeads).where(eq(jobLeads.id, leadId)).limit(1);
    if (!lead) continue;
    createdLeads.push(lead);
    if (analysis.status === "Prepared" && raw.publicContactEmail && analysis.subject && analysis.body) {
      await db.insert(outreachDrafts).values({ runId: run.id, leadId: lead.id, recipientEmail: raw.publicContactEmail, subject: analysis.subject, body: analysis.body });
    }
  }

  const report = buildReport(today, createdLeads);
  const audit = buildAudit(today, createdLeads);
  const reportStored = await storagePut(`${ownerOpenId}/reports/${runKey}.md`, report, "text/markdown");
  const auditStored = await storagePut(`${ownerOpenId}/audits/${runKey}.jsonl`, audit, "application/x-ndjson");
  await db.insert(workspaceFiles).values([
    { ownerOpenId, runId: run.id, kind: "report", filename: `pharma-job-report-${today}.md`, storageKey: reportStored.key, storageUrl: reportStored.url, mimeType: "text/markdown" },
    { ownerOpenId, runId: run.id, kind: "audit", filename: `pharma-job-audit-${today}.jsonl`, storageKey: auditStored.key, storageUrl: auditStored.url, mimeType: "application/x-ndjson" },
  ]);
  const linkedFiles = await db.select().from(workspaceFiles).where(eq(workspaceFiles.runId, run.id));
  const reportFile = linkedFiles.find(file => file.kind === "report");
  const auditFile = linkedFiles.find(file => file.kind === "audit");
  const preparedCount = createdLeads.filter(lead => lead.status === "Prepared").length;
  const sentCount = createdLeads.filter(lead => lead.status === "Verified-Sent").length;
  const skippedCount = createdLeads.length - preparedCount - sentCount;
  await db.update(jobRuns).set({ status: "completed", totalAudited: createdLeads.length, preparedCount, sentCount, skippedCount, reportFileId: reportFile?.id ?? null, auditFileId: auditFile?.id ?? null, completedAt: new Date() }).where(eq(jobRuns.id, run.id));
  await notifyOwner({ title: "Daily pharma search complete", content: `${preparedCount} new drafts are ready for Balaji Rajput. ${skippedCount} leads were skipped. Review is required before any outreach.` });
  return { runId: run.id, preparedCount, skippedCount, totalAudited: createdLeads.length };
}

export async function recordConfirmedSend(ownerOpenId: string, draftId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const rows = await db.select({ draft: outreachDrafts, run: jobRuns })
    .from(outreachDrafts)
    .innerJoin(jobRuns, eq(outreachDrafts.runId, jobRuns.id))
    .where(and(eq(outreachDrafts.id, draftId), eq(jobRuns.ownerOpenId, ownerOpenId))).limit(1);
  const row = rows[0];
  if (!row) throw new Error("Draft not found");
  if (row.draft.status === "Verified-Sent") {
    return { alreadySent: true, deliveryConfigured: true, deliverySent: true };
  }

  const webhookUrl = process.env.OUTBOUND_EMAIL_WEBHOOK_URL;
  const confirmedAt = new Date();
  if (!webhookUrl) {
    await db.update(outreachDrafts).set({ confirmedAt }).where(eq(outreachDrafts.id, draftId));
    await db.insert(deliveryEvents).values({
      draftId,
      ownerOpenId,
      eventType: "confirmation-held",
      details: "Owner pressed Confirm & Send, but no outbound provider is configured. Nothing was delivered.",
    });
    return { alreadySent: false, deliveryConfigured: false, deliverySent: false };
  }

  const deliveryResponse = await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      draftId,
      recipientEmail: row.draft.recipientEmail,
      subject: row.draft.subject,
      body: row.draft.body,
      ownerOpenId,
      trigger: "confirm-and-send",
    }),
  });
  if (!deliveryResponse.ok) {
    const detail = await deliveryResponse.text().catch(() => "");
    throw new Error(`Configured delivery provider rejected this confirmed send (${deliveryResponse.status})${detail ? `: ${detail}` : ""}`);
  }
  const deliveryPayload = await deliveryResponse.json().catch(() => ({})) as { id?: string; messageId?: string };
  const deliveryReference = deliveryPayload.messageId ?? deliveryPayload.id ?? `confirmed-${draftId}-${Date.now()}`;

  await db.update(outreachDrafts)
    .set({ status: "Verified-Sent", confirmedAt, sentAt: confirmedAt, deliveryReference })
    .where(eq(outreachDrafts.id, draftId));
  await db.update(jobLeads).set({ status: "Verified-Sent" }).where(eq(jobLeads.id, row.draft.leadId));
  await db.update(jobRuns)
    .set({
      preparedCount: sql`GREATEST(${jobRuns.preparedCount} - 1, 0)`,
      sentCount: sql`${jobRuns.sentCount} + 1`,
    })
    .where(eq(jobRuns.id, row.run.id));
  await db.insert(deliveryEvents).values({
    draftId,
    ownerOpenId,
    eventType: "verified-sent",
    details: `Confirmed send accepted by configured provider. Reference: ${deliveryReference}`,
  });
  return { alreadySent: false, deliveryConfigured: true, deliverySent: true, deliveryReference };
}

export function summarizeLeadStatuses(statuses: string[]) {
  return statuses.reduce<Record<string, number>>((summary, status) => {
    summary[status] = (summary[status] ?? 0) + 1;
    return summary;
  }, {});
}

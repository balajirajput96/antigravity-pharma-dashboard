import type { Request, Response } from "express";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { workflowSettings } from "../drizzle/schema";
import { getDb } from "./db";
import { ingestJobRun } from "./jobWorkflow";
import { sdk } from "./_core/sdk";

const incomingLead = z.object({
  employer: z.string().min(2),
  roleTitle: z.string().min(2),
  location: z.string().optional(),
  postingDate: z.string().optional(),
  sourceUrl: z.string().url(),
  publicContactEmail: z.string().email().optional(),
  publicContactEvidence: z.string().optional(),
  vacancyText: z.string().min(20),
  status: z
    .enum([
      "Prepared",
      "Verified-Sent",
      "Skipped-Role mismatch",
      "Skipped-Duplicate",
    ])
    .optional(),
  roleFit: z.string().optional(),
  eligibilityNotes: z.string().optional(),
  draftSubject: z.string().optional(),
  draftBody: z.string().optional(),
});

export async function registerJobSearchCron(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid)
      return res.status(403).json({ error: "cron-only" });
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const settings = await db.select().from(workflowSettings).limit(1);
    const ownerSettings = settings[0];
    if (!ownerSettings)
      return res
        .status(409)
        .json({ error: "Owner workflow is not initialized" });
    if (
      ownerSettings.scheduleCronTaskUid &&
      ownerSettings.scheduleCronTaskUid !== user.taskUid
    ) {
      return res
        .status(409)
        .json({ error: "A different daily agent is already registered" });
    }
    await db
      .update(workflowSettings)
      .set({ scheduleCronTaskUid: user.taskUid, scheduleEnabled: 1 })
      .where(eq(workflowSettings.id, ownerSettings.id));
    return res.json({ ok: true, taskUid: user.taskUid });
  } catch (error) {
    return res
      .status(500)
      .json({ error: String(error), timestamp: new Date().toISOString() });
  }
}

/**
 * Exact 10:00 IST cron callback. The app deliberately never fabricates a
 * vacancy or impersonates a local CLI session. A configured public-vacancy
 * source must submit verified candidate leads to the ingestion endpoint.
 */
export async function runDailySearch(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid)
      return res.status(403).json({ error: "cron-only" });
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const settings = await db
      .select()
      .from(workflowSettings)
      .where(eq(workflowSettings.scheduleCronTaskUid, user.taskUid))
      .limit(1);
    if (!settings[0])
      return res.status(409).json({ error: "Unregistered task UID" });
    return res.status(202).json({
      ok: true,
      status: "awaiting-verified-lead-source",
      message:
        "The daily safety-gated run started. Only leads supplied by a configured public-vacancy source may be ingested.",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: String(error), timestamp: new Date().toISOString() });
  }
}

export async function ingestDailyJobSearch(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid)
      return res.status(403).json({ error: "cron-only" });
    const payload = z
      .object({ leads: z.array(incomingLead).max(30) })
      .parse(req.body);
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const settings = await db
      .select()
      .from(workflowSettings)
      .where(eq(workflowSettings.scheduleCronTaskUid, user.taskUid))
      .limit(1);
    const setting = settings[0];
    if (!setting)
      return res.status(409).json({ error: "Unregistered task UID" });
    const result = await ingestJobRun(
      setting.ownerOpenId,
      payload.leads,
      "scheduled"
    );
    return res.json({ ok: true, result });
  } catch (error) {
    return res.status(500).json({
      error: String(error),
      timestamp: new Date().toISOString(),
      context: { path: "/api/scheduled/ingest-job-search" },
    });
  }
}

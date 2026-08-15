import { z } from "zod";
import { parse as parseCookie } from "cookie";
import { eq } from "drizzle-orm";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { createInstructionFile, DAILY_AGENT_INSTRUCTIONS, ensureWorkflowSettings, listDashboard, recordConfirmedSend } from "./jobWorkflow";
import { requireOwner } from "./owner";
import { createHeartbeatJob, updateHeartbeatJob } from "./_core/heartbeat";
import { getDb } from "./db";
import { workflowSettings } from "../drizzle/schema";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  workspace: router({
    dashboard: protectedProcedure.query(async ({ ctx }) => {
      const owner = requireOwner(ctx.user);
      return listDashboard(owner.openId);
    }),
    initialize: protectedProcedure.mutation(async ({ ctx }) => {
      const owner = requireOwner(ctx.user);
      const file = await createInstructionFile(owner.openId);
      return { file, instructions: DAILY_AGENT_INSTRUCTIONS };
    }),
    activateDailySchedule: protectedProcedure.mutation(async ({ ctx }) => {
      const owner = requireOwner(ctx.user);
      const settings = await ensureWorkflowSettings(owner.openId);
      const sessionToken = parseCookie(ctx.req.headers.cookie ?? "")[COOKIE_NAME] ?? "";
      const job = {
        name: "balaji-pharma-daily-research",
        cron: "0 30 4 * * *",
        path: "/api/scheduled/run-daily-search",
        payload: { owner: "Balaji Rajput", run: "daily-pharma-research" },
        description: "Daily 10:00 IST pharma QA/IPQA/QMS/OSD research handoff for Balaji Rajput.",
      } as const;
      let taskUid = settings.scheduleCronTaskUid;
      let nextExecutionAt: string | null | undefined;
      if (taskUid) {
        const result = await updateHeartbeatJob(taskUid, { cron: job.cron, path: job.path, payload: job.payload, description: job.description, enable: true }, sessionToken);
        nextExecutionAt = result.nextExecutionAt;
      } else {
        const result = await createHeartbeatJob(job, sessionToken);
        taskUid = result.taskUid;
        nextExecutionAt = result.nextExecutionAt;
      }
      const db = await getDb();
      if (!db) throw new Error("Database is unavailable");
      await db.update(workflowSettings).set({ scheduleCronTaskUid: taskUid, scheduleEnabled: 1 }).where(eq(workflowSettings.ownerOpenId, owner.openId));
      return { scheduleEnabled: true, taskUid, nextExecutionAt: nextExecutionAt ?? null };
    }),
    confirmAndSend: protectedProcedure.input(z.object({ draftId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      const owner = requireOwner(ctx.user);
      return recordConfirmedSend(owner.openId, input.draftId);
    }),
  }),
});

export type AppRouter = typeof appRouter;

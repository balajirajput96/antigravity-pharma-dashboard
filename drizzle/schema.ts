import {
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const workflowSettings = mysqlTable(
  "workflow_settings",
  {
    id: int("id").autoincrement().primaryKey(),
    ownerOpenId: varchar("ownerOpenId", { length: 64 }).notNull(),
    scheduleCronTaskUid: varchar("scheduleCronTaskUid", { length: 65 }),
    scheduleEnabled: int("scheduleEnabled").default(0).notNull(),
    cronExpression: varchar("cronExpression", { length: 64 }).default("0 30 4 * * *").notNull(),
    candidateProfile: text("candidateProfile").notNull(),
    agentInstructionFileId: int("agentInstructionFileId"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("workflow_owner_unique").on(table.ownerOpenId)]
);

export const jobRuns = mysqlTable(
  "job_runs",
  {
    id: int("id").autoincrement().primaryKey(),
    ownerOpenId: varchar("ownerOpenId", { length: 64 }).notNull(),
    runKey: varchar("runKey", { length: 80 }).notNull(),
    runDate: varchar("runDate", { length: 10 }).notNull(),
    runMode: mysqlEnum("runMode", ["scheduled", "manual-import"]).default("scheduled").notNull(),
    status: mysqlEnum("runStatus", ["running", "completed", "failed"]).default("running").notNull(),
    totalAudited: int("totalAudited").default(0).notNull(),
    preparedCount: int("preparedCount").default(0).notNull(),
    sentCount: int("sentCount").default(0).notNull(),
    skippedCount: int("skippedCount").default(0).notNull(),
    reportFileId: int("reportFileId"),
    auditFileId: int("auditFileId"),
    startedAt: timestamp("startedAt").defaultNow().notNull(),
    completedAt: timestamp("completedAt"),
  },
  table => [
    uniqueIndex("job_runs_owner_key_unique").on(table.ownerOpenId, table.runKey),
    index("job_runs_owner_date_idx").on(table.ownerOpenId, table.runDate),
  ]
);

export const jobLeads = mysqlTable(
  "job_leads",
  {
    id: int("id").autoincrement().primaryKey(),
    runId: int("runId").notNull(),
    employer: varchar("employer", { length: 240 }).notNull(),
    roleTitle: varchar("roleTitle", { length: 240 }).notNull(),
    location: varchar("location", { length: 240 }),
    postingDate: varchar("postingDate", { length: 32 }),
    sourceUrl: text("sourceUrl").notNull(),
    publicContactEmail: varchar("publicContactEmail", { length: 320 }),
    publicContactEvidence: text("publicContactEvidence"),
    vacancyText: text("vacancyText").notNull(),
    roleFit: text("roleFit"),
    eligibilityNotes: text("eligibilityNotes"),
    status: varchar("status", { length: 32 }).notNull(),
    duplicateOfLeadId: int("duplicateOfLeadId"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("job_leads_run_idx").on(table.runId), index("job_leads_employer_idx").on(table.employer)]
);

export const outreachDrafts = mysqlTable(
  "outreach_drafts",
  {
    id: int("id").autoincrement().primaryKey(),
    runId: int("runId").notNull(),
    leadId: int("leadId").notNull(),
    recipientEmail: varchar("recipientEmail", { length: 320 }).notNull(),
    subject: text("subject").notNull(),
    body: text("body").notNull(),
    status: mysqlEnum("draftStatus", ["Prepared", "Verified-Sent"]).default("Prepared").notNull(),
    confirmedAt: timestamp("confirmedAt"),
    sentAt: timestamp("sentAt"),
    deliveryReference: varchar("deliveryReference", { length: 255 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("outreach_drafts_status_idx").on(table.status), index("outreach_drafts_run_idx").on(table.runId)]
);

export const workspaceFiles = mysqlTable(
  "workspace_files",
  {
    id: int("id").autoincrement().primaryKey(),
    ownerOpenId: varchar("ownerOpenId", { length: 64 }).notNull(),
    runId: int("runId"),
    kind: mysqlEnum("workspaceFileKind", ["report", "audit", "instruction"]).notNull(),
    filename: varchar("filename", { length: 255 }).notNull(),
    storageKey: varchar("storageKey", { length: 512 }).notNull(),
    storageUrl: text("storageUrl").notNull(),
    mimeType: varchar("mimeType", { length: 160 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("workspace_files_owner_idx").on(table.ownerOpenId), index("workspace_files_run_idx").on(table.runId)]
);

export const deliveryEvents = mysqlTable(
  "delivery_events",
  {
    id: int("id").autoincrement().primaryKey(),
    draftId: int("draftId").notNull(),
    ownerOpenId: varchar("ownerOpenId", { length: 64 }).notNull(),
    eventType: varchar("eventType", { length: 64 }).notNull(),
    details: text("details"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("delivery_events_draft_idx").on(table.draftId)]
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

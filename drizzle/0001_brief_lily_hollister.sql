CREATE TABLE `delivery_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`draftId` int NOT NULL,
	`ownerOpenId` varchar(64) NOT NULL,
	`eventType` varchar(64) NOT NULL,
	`details` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `delivery_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `job_leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`runId` int NOT NULL,
	`employer` varchar(240) NOT NULL,
	`roleTitle` varchar(240) NOT NULL,
	`location` varchar(240),
	`postingDate` varchar(32),
	`sourceUrl` text NOT NULL,
	`publicContactEmail` varchar(320),
	`publicContactEvidence` text,
	`vacancyText` text NOT NULL,
	`roleFit` text,
	`eligibilityNotes` text,
	`status` varchar(32) NOT NULL,
	`duplicateOfLeadId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `job_leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `job_runs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerOpenId` varchar(64) NOT NULL,
	`runKey` varchar(80) NOT NULL,
	`runDate` varchar(10) NOT NULL,
	`runMode` enum('scheduled','manual-import') NOT NULL DEFAULT 'scheduled',
	`runStatus` enum('running','completed','failed') NOT NULL DEFAULT 'running',
	`totalAudited` int NOT NULL DEFAULT 0,
	`preparedCount` int NOT NULL DEFAULT 0,
	`sentCount` int NOT NULL DEFAULT 0,
	`skippedCount` int NOT NULL DEFAULT 0,
	`reportFileId` int,
	`auditFileId` int,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `job_runs_id` PRIMARY KEY(`id`),
	CONSTRAINT `job_runs_owner_key_unique` UNIQUE(`ownerOpenId`,`runKey`)
);
--> statement-breakpoint
CREATE TABLE `outreach_drafts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`runId` int NOT NULL,
	`leadId` int NOT NULL,
	`recipientEmail` varchar(320) NOT NULL,
	`subject` text NOT NULL,
	`body` text NOT NULL,
	`draftStatus` enum('Prepared','Verified-Sent') NOT NULL DEFAULT 'Prepared',
	`confirmedAt` timestamp,
	`sentAt` timestamp,
	`deliveryReference` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `outreach_drafts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workflow_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerOpenId` varchar(64) NOT NULL,
	`scheduleCronTaskUid` varchar(65),
	`scheduleEnabled` int NOT NULL DEFAULT 0,
	`cronExpression` varchar(64) NOT NULL DEFAULT '0 30 4 * * *',
	`candidateProfile` text NOT NULL,
	`agentInstructionFileId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workflow_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `workflow_owner_unique` UNIQUE(`ownerOpenId`)
);
--> statement-breakpoint
CREATE TABLE `workspace_files` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerOpenId` varchar(64) NOT NULL,
	`runId` int,
	`workspaceFileKind` enum('report','audit','instruction') NOT NULL,
	`filename` varchar(255) NOT NULL,
	`storageKey` varchar(512) NOT NULL,
	`storageUrl` text NOT NULL,
	`mimeType` varchar(160) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `workspace_files_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `delivery_events_draft_idx` ON `delivery_events` (`draftId`);--> statement-breakpoint
CREATE INDEX `job_leads_run_idx` ON `job_leads` (`runId`);--> statement-breakpoint
CREATE INDEX `job_leads_employer_idx` ON `job_leads` (`employer`);--> statement-breakpoint
CREATE INDEX `job_runs_owner_date_idx` ON `job_runs` (`ownerOpenId`,`runDate`);--> statement-breakpoint
CREATE INDEX `outreach_drafts_status_idx` ON `outreach_drafts` (`draftStatus`);--> statement-breakpoint
CREATE INDEX `outreach_drafts_run_idx` ON `outreach_drafts` (`runId`);--> statement-breakpoint
CREATE INDEX `workspace_files_owner_idx` ON `workspace_files` (`ownerOpenId`);--> statement-breakpoint
CREATE INDEX `workspace_files_run_idx` ON `workspace_files` (`runId`);
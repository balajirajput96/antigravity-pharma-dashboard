export const workflowStatuses = [
  "Prepared",
  "Verified-Sent",
  "Skipped-Role mismatch",
  "Skipped-Duplicate",
] as const;

export type WorkflowStatus = (typeof workflowStatuses)[number];
export type ApprovedImportKind = "hindi-report" | "jsonl-audit";

export function isWorkflowStatus(value: string): value is WorkflowStatus {
  return workflowStatuses.includes(value as WorkflowStatus);
}

export function isApprovedImport(kind: string, mimeType: string) {
  return (kind === "hindi-report" && mimeType === "text/markdown")
    || (kind === "jsonl-audit" && mimeType === "application/x-ndjson");
}

export function canRecordConfirmationHold(status: string, deliveryProviderConfigured: boolean) {
  return status === "Prepared" && !deliveryProviderConfigured;
}

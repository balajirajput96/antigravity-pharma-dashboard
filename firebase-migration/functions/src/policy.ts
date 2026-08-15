export const workflowStatuses = [
  "Prepared",
  "Verified-Sent",
  "Skipped-Role mismatch",
  "Skipped-Duplicate",
] as const;

export type WorkflowStatus = (typeof workflowStatuses)[number];
export type ApprovedImportKind = "report" | "audit";

export function isWorkflowStatus(value: string): value is WorkflowStatus {
  return workflowStatuses.includes(value as WorkflowStatus);
}

export function isApprovedImport(kind: string, mimeType: string) {
  return (kind === "report" && (mimeType === "text/markdown" || mimeType === "text/plain"))
    || (kind === "audit" && (mimeType === "application/x-ndjson" || mimeType === "application/jsonl" || mimeType === "text/plain"));
}

export function canRecordConfirmationHold(status: string, deliveryProviderConfigured: boolean) {
  return status === "Prepared" && !deliveryProviderConfigured;
}

export const WORKFLOW_STATUS = {
  prepared: "Prepared",
  sent: "Verified-Sent",
  roleMismatch: "Skipped-Role mismatch",
  duplicate: "Skipped-Duplicate",
} as const;

export type WorkflowStatus =
  (typeof WORKFLOW_STATUS)[keyof typeof WORKFLOW_STATUS];

export function mayRecordConfirmationHold(
  status: string,
  deliveryConfigured = false
) {
  return status === WORKFLOW_STATUS.prepared && !deliveryConfigured;
}

export function isApprovedWorkspaceImport(kind: string, mimeType: string) {
  return (
    (kind === "hindi-report" && mimeType === "text/markdown") ||
    (kind === "jsonl-audit" && mimeType === "application/x-ndjson")
  );
}

export function ownerDataPath(uid: string) {
  const normalized = uid.trim();
  if (!normalized) throw new Error("A Firebase owner UID is required.");
  return `owners/${normalized}`;
}

export const FIREBASE_WORKFLOW_STATUSES = [
  "Prepared",
  "Verified-Sent",
  "Skipped-Role mismatch",
  "Skipped-Duplicate",
] as const;

export function allowsFirebaseConfirmationHold(status: string, deliveryProviderConfigured: boolean) {
  return status === "Prepared" && !deliveryProviderConfigured;
}

export function isApprovedFirebaseMigrationFile(kind: string, mimeType: string) {
  if (kind === "report") return mimeType === "text/markdown" || mimeType === "text/plain";
  if (kind === "audit") return ["application/x-ndjson", "application/jsonl", "text/plain"].includes(mimeType);
  return false;
}

export const FIREBASE_WORKFLOW_STATUSES = [
  "Prepared",
  "Verified-Sent",
  "Skipped-Role mismatch",
  "Skipped-Duplicate",
] as const;

export function allowsFirebaseConfirmationHold(
  status: string,
  deliveryProviderConfigured: boolean
) {
  return status === "Prepared" && !deliveryProviderConfigured;
}

export function isApprovedFirebaseMigrationFile(
  kind: string,
  mimeType: string
) {
  if (kind === "hindi-report") return mimeType === "text/markdown";
  if (kind === "jsonl-audit") return mimeType === "application/x-ndjson";
  return false;
}

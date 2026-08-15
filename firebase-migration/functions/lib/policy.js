export const workflowStatuses = [
    "Prepared",
    "Verified-Sent",
    "Skipped-Role mismatch",
    "Skipped-Duplicate",
];
export function isWorkflowStatus(value) {
    return workflowStatuses.includes(value);
}
export function isApprovedImport(kind, mimeType) {
    return (kind === "hindi-report" && mimeType === "text/markdown")
        || (kind === "jsonl-audit" && mimeType === "application/x-ndjson");
}
export function canRecordConfirmationHold(status, deliveryProviderConfigured) {
    return status === "Prepared" && !deliveryProviderConfigured;
}

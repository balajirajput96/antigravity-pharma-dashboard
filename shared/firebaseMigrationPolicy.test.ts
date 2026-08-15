import { describe, expect, it } from "vitest";
import {
  allowsFirebaseConfirmationHold,
  FIREBASE_WORKFLOW_STATUSES,
  isApprovedFirebaseMigrationFile,
} from "./firebaseMigrationPolicy";

describe("Firebase migration policy", () => {
  it("preserves the exact private-workspace status labels", () => {
    expect(FIREBASE_WORKFLOW_STATUSES).toEqual([
      "Prepared",
      "Verified-Sent",
      "Skipped-Role mismatch",
      "Skipped-Duplicate",
    ]);
  });

  it("records confirmation holds only for a prepared draft with no provider", () => {
    expect(allowsFirebaseConfirmationHold("Prepared", false)).toBe(true);
    expect(allowsFirebaseConfirmationHold("Verified-Sent", false)).toBe(false);
    expect(allowsFirebaseConfirmationHold("Prepared", true)).toBe(false);
  });

  it("accepts only Hindi-report and JSONL-audit file types for later owner-only migration", () => {
    expect(isApprovedFirebaseMigrationFile("hindi-report", "text/markdown")).toBe(true);
    expect(isApprovedFirebaseMigrationFile("jsonl-audit", "application/x-ndjson")).toBe(true);
    expect(isApprovedFirebaseMigrationFile("report", "text/markdown")).toBe(false);
    expect(isApprovedFirebaseMigrationFile("resume", "application/pdf")).toBe(false);
  });
});

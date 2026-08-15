import { describe, expect, it } from "vitest";
import { WORKFLOW_STATUS, isApprovedWorkspaceImport, mayRecordConfirmationHold, ownerDataPath } from "./firebaseHostingPolicy";

describe("Firebase Hosting migration policy", () => {
  it("records confirmation only for a Prepared draft while delivery is disabled", () => {
    expect(mayRecordConfirmationHold(WORKFLOW_STATUS.prepared, false)).toBe(true);
    expect(mayRecordConfirmationHold(WORKFLOW_STATUS.sent, false)).toBe(false);
    expect(mayRecordConfirmationHold(WORKFLOW_STATUS.prepared, true)).toBe(false);
  });

  it("allows only approved no-data migration file kinds", () => {
    expect(isApprovedWorkspaceImport("hindi-report", "text/markdown")).toBe(true);
    expect(isApprovedWorkspaceImport("jsonl-audit", "application/x-ndjson")).toBe(true);
    expect(isApprovedWorkspaceImport("resume", "application/pdf")).toBe(false);
  });

  it("scopes workspace access to an owner path", () => {
    expect(ownerDataPath("owner-123")).toBe("owners/owner-123");
    expect(() => ownerDataPath(" ")).toThrow("Firebase owner UID");
  });
});

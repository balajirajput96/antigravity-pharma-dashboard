import { describe, expect, it } from "vitest";
import { summarizeLeadStatuses } from "./jobWorkflow";

describe("pharma workflow status rules", () => {
  it("preserves the exact reporting labels required by the owner", () => {
    expect(
      summarizeLeadStatuses([
        "Prepared",
        "Prepared",
        "Verified-Sent",
        "Skipped-Role mismatch",
        "Skipped-Duplicate",
      ])
    ).toEqual({
      Prepared: 2,
      "Verified-Sent": 1,
      "Skipped-Role mismatch": 1,
      "Skipped-Duplicate": 1,
    });
  });

  it("does not invent a status for an empty audit", () => {
    expect(summarizeLeadStatuses([])).toEqual({});
  });
});

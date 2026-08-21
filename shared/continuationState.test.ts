import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

type ContinuationState = {
  mode: string;
  repository: {
    verifiedCommit: string;
    remoteSynchronized: boolean;
  };
  validation: {
    unitTests: { status: string; files: number; tests: number };
    githubActionsVerification: string;
  };
  schedules: {
    taskLevelDailyResearch: { status: string };
    requestedHourlyContinuation: {
      status: string;
      requestedCycles: number;
      reason: string;
    };
  };
  safety: {
    externalOutreachRequiresDirectConfirmation: boolean;
    noLoginOrAuthenticationAutomation: boolean;
    noSensitiveDataUse: boolean;
    noUnattendedCodeAuthoringOrPublishing: boolean;
  };
};

describe("continuation state record", () => {
  it("remains machine-readable and preserves the verified maintenance boundary", () => {
    const state = JSON.parse(
      readFileSync(
        resolve(process.cwd(), "automation/continuation-state.json"),
        "utf8"
      )
    ) as ContinuationState;

    expect(state.mode).toBe("bounded-verification-only");
    expect(state.repository.verifiedCommit).toMatch(/^[0-9a-f]{40}$/);
    expect(state.repository.remoteSynchronized).toBe(true);
    expect(state.validation.unitTests).toEqual({
      status: "passed",
      files: 9,
      tests: 19,
    });
    expect(state.validation.githubActionsVerification).toBe("passed");
    expect(state.schedules.taskLevelDailyResearch.status).toBe("active");
    expect(state.schedules.requestedHourlyContinuation).toMatchObject({
      status: "not-created",
      requestedCycles: 2400,
    });
    expect(state.schedules.requestedHourlyContinuation.reason).toContain(
      "durable authorized execution context"
    );
    expect(state.safety).toEqual({
      externalOutreachRequiresDirectConfirmation: true,
      noLoginOrAuthenticationAutomation: true,
      noSensitiveDataUse: true,
      noCredentialValuesRecorded: true,
      noUnattendedCodeAuthoringOrPublishing: true,
    });
  });
});

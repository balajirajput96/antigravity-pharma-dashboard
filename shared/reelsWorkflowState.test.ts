import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

type ReelsWorkflowState = {
  workflow: string;
  scope: { separateFrom: string; language: string; targetFormat: string };
  storage: { status: string; folderIdRecordedOutsideRepository: boolean };
  reels: {
    "0001": {
      status: string;
      evidenceRecord: string;
      drivePackageVerifiedAt: string;
      externalPublishingStatus: string;
    };
    "0002": {
      status: string;
      topic: string;
      researchStatus: string;
      evidenceRecord: string;
      driveCandidate: { video: string; sourceCaptions: string; visualQa: string };
      releaseStatus: string;
      externalPublishingStatus: string;
    };
  };
  productionPolicy: {
    researchBeforeProduction: boolean;
    requireHindiCaptions: boolean;
    requireVisualQa: boolean;
    requireDrivePackageVerification: boolean;
    automaticBulkGeneration: boolean;
    automaticExternalPublishing: boolean;
    noPrivateOrSensitiveData: boolean;
  };
  scheduling: { status: string };
};

const projectRoot = path.resolve(import.meta.dirname, "..");
const statePath = path.join(
  projectRoot,
  "automation/reels/reels-continuation-state.json"
);

describe("reels continuation state", () => {
  it("keeps the reels workflow separate, evidence-gated, and non-publishing", async () => {
    const state = JSON.parse(
      await readFile(statePath, "utf8")
    ) as ReelsWorkflowState;

    expect(state.workflow).toBe("hindi-research-reels");
    expect(state.scope).toMatchObject({
      separateFrom: "agy_pharma_job_task",
      language: "Hindi",
      targetFormat: "60-second vertical reel",
    });
    expect(state.storage).toMatchObject({
      status: "verified-private-folder-access",
      folderIdRecordedOutsideRepository: true,
    });
    expect(state.reels["0001"].status).toBe(
      "drive-uploaded-and-verified-accessibility-revision"
    );
    expect(state.reels["0001"].drivePackageVerifiedAt).toBe("2026-08-22");
    expect(state.reels["0001"].externalPublishingStatus).toBe("not-published");
    expect(state.reels["0002"]).toMatchObject({
      status: "drive-candidate-audited-requires-caption-reconciliation",
      topic: "Zeigarnik effect: interrupted tasks, recall, and resumption",
      researchStatus: "independently-verified",
      evidenceRecord: "automation/reels/REEL_0002_DISCOVERY_AUDIT_2026-08-22.md",
      releaseStatus: "not-release-approved",
      externalPublishingStatus: "not-published",
    });
    expect(state.reels["0002"].driveCandidate).toMatchObject({
      video: "H.264/AAC, 720x1280, 30 fps, 54.120 seconds",
      sourceCaptions:
        "Hindi SRT is present, but its final cue ends at 58.5 seconds after the candidate video ends.",
    });
    expect(state.productionPolicy).toMatchObject({
      researchBeforeProduction: true,
      requireHindiCaptions: true,
      requireVisualQa: true,
      requireDrivePackageVerification: true,
      automaticBulkGeneration: false,
      automaticExternalPublishing: false,
      noPrivateOrSensitiveData: true,
    });
    expect(state.scheduling.status).toBe("not-created");
  });
});

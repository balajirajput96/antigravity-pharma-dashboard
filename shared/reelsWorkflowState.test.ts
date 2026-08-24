import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

type ReelsWorkflowState = {
  workflow: string;
  scope: { separateFrom: string; language: string; targetFormat: string };
  storage: { status: string; folderIdRecordedOutsideRepository: boolean };
  masterProgress: {
    target: number;
    verifiedCompleted: number;
    pending: number;
    failed: { count: number; reelIds: string[]; definition: string };
    retryQueue: Array<{
      reelId: string;
      gate: string;
      status: string;
      record: string;
    }>;
    currentBatch: {
      id: string;
      sequence: number;
      reelRange: string;
      verifiedCompleted: number;
      pending: number;
      status: string;
    };
    currentReel: string;
    batchRoadmap: {
      batchSize: number;
      plannedBatchCount: number;
      rangeRule: string;
      advanceRule: string;
    };
    sourceRegistry: {
      status: string;
      location: string;
      entries: Array<{ reelId: string; topic: string; evidenceRecord: string }>;
    };
    lastInventory: { date: string; basis: string; publicationStatus: string };
  };
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
      package: string[];
      drivePackageVerifiedAt: string;
      releaseStatus: string;
      externalPublishingStatus: string;
    };
    "0003": {
      status: string;
      topic: string;
      researchStatus: string;
      evidenceRecord: string;
      productionBlueprint: string;
      narrationTechnicalCheck: {
        record: string;
        format: string;
        durationSeconds: number;
        status: string;
        assemblyGate: string;
        v3TimingCandidate: {
          record: string;
          format: string;
          durationSeconds: number;
          speechToTextFidelity: string;
          storage: string;
        };
      };
      videoGeneration: {
        status: string;
        attemptCount: number;
        generatedClipCount: number;
        capacityBlockedAttemptCount: number;
        localArtifact: string;
        retryRecord: string;
      };
      releaseStatus: string;
      externalPublishingStatus: string;
    };
    "0004": {
      status: string;
      topic: string;
      researchStatus: string;
      evidenceRecord: string;
      productionBlueprint: string;
      narrationTechnicalCheck: {
        record: string;
        format: string;
        durationSeconds: number;
        storage: string;
        status: string;
      };
      finalProductionGate: {
        record: string;
        status: string;
        finalRenderAllowed: boolean;
        driveUploadAllowed: boolean;
        verifiedCountEligible: boolean;
      };
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
    expect(state.masterProgress).toMatchObject({
      target: 3000,
      verifiedCompleted: 3,
      pending: 2997,
      currentReel: "0004",
      lastInventory: {
        date: "2026-08-23",
        publicationStatus: "not-published",
      },
    });
    expect(state.masterProgress.retryQueue).toEqual([]);
    expect(state.masterProgress.failed).toMatchObject({
      count: 0,
      reelIds: [],
    });
    expect(state.masterProgress.currentBatch).toEqual({
      id: "Batch_001",
      sequence: 1,
      reelRange: "0001-0030",
      verifiedCompleted: 3,
      pending: 27,
      status: "in-progress",
    });
    expect(state.masterProgress.batchRoadmap).toMatchObject({
      batchSize: 30,
      plannedBatchCount: 100,
    });
    expect(state.masterProgress.sourceRegistry.entries).toEqual([
      {
        reelId: "0001",
        topic: "Habit formation: why 21 days is not a universal rule",
        evidenceRecord: "automation/REEL_0001_SOURCE_VERIFICATION_2026-08-22.md",
      },
      {
        reelId: "0002",
        topic: "Zeigarnik effect: interrupted tasks, recall, and resumption",
        evidenceRecord: "automation/reels/REEL_0002_DISCOVERY_AUDIT_2026-08-22.md",
      },
      {
        reelId: "0003",
        topic: "Retrieval practice: recalling rather than rereading",
        evidenceRecord: "automation/reels/REEL_0003_RESEARCH_DRAFT_2026-08-22.md",
      },
      {
        reelId: "0004",
        topic: "Spacing effect: a learning plan, not a magic calendar",
        evidenceRecord: "automation/reels/REEL_0004_RESEARCH_DRAFT_2026-08-23.md",
      },
    ]);
    expect(state.reels["0001"].status).toBe(
      "drive-uploaded-and-verified-accessibility-revision"
    );
    expect(state.reels["0001"].drivePackageVerifiedAt).toBe("2026-08-22");
    expect(state.reels["0001"].externalPublishingStatus).toBe("not-published");
    expect(state.reels["0002"]).toMatchObject({
      status: "drive-uploaded-and-verified-accessibility-revision",
      topic: "Zeigarnik effect: interrupted tasks, recall, and resumption",
      researchStatus: "independently-verified",
      evidenceRecord: "automation/reels/REEL_0002_DISCOVERY_AUDIT_2026-08-22.md",
      drivePackageVerifiedAt: "2026-08-22",
      releaseStatus: "private-drive-package-verified-review-ready",
      externalPublishingStatus: "not-published",
    });
    expect(state.reels["0002"].driveCandidate).toMatchObject({
      video: "H.264/AAC, 720x1280, 30 fps, 54.120 seconds",
      sourceCaptions:
        "Original Hindi SRT is retained and ends at 58.5 seconds; corrected V2 Hindi SRT ends at 54.120 seconds and is paired with the accessibility revision.",
    });
    expect(state.reels["0002"].package).toEqual([
      "accessibility MP4 revision V4",
      "duration-matched Hindi SRT V2",
      "accessibility revision QA record",
      "existing independently verified research and source metadata",
    ]);
    expect(state.reels["0003"]).toMatchObject({
      status: "private-drive-package-verified",
      topic: "Retrieval practice: recalling rather than rereading",
      researchStatus: "independently-verified",
      evidenceRecord: "automation/reels/REEL_0003_RESEARCH_DRAFT_2026-08-22.md",
      productionBlueprint: "automation/reels/REEL_0003_PRODUCTION_BLUEPRINT_2026-08-22.md",
      drivePackageVerifiedAt: "2026-08-23",
      releaseStatus: "private-drive-package-verified-review-ready",
      externalPublishingStatus: "not-published",
    });
    expect(state.reels["0003"].narrationTechnicalCheck).toEqual({
      record: "automation/reels/REEL_0003_NARRATION_TECHNICAL_CHECK_2026-08-23.md",
      format: "PCM s16le WAV, 24 kHz mono",
      durationSeconds: 47.44,
      status: "original-retained-v3-local-timing-candidate-created",
      assemblyGate:
        "Use the local V3 59.571-second timing candidate only after final clip, caption, audio, and package QA; it was derived through a 0.80× tempo-preserving stretch with no silence padding.",
      v3TimingCandidate: {
        record: "automation/reels/REEL_0003_NARRATION_V3_TIMING_QA_2026-08-23.md",
        format: "PCM s16le WAV, 24 kHz mono",
        durationSeconds: 59.571,
        speechToTextFidelity:
          "completed-hindi-transcript-matches-approved-evidence-safe-script",
        storage: "local-only",
      },
    });
    expect(state.reels["0003"].videoGeneration).toEqual({
      status: "clip-01-local-generated-external-clip-02-capacity-blocked-local-procedural-fallback-assembled",
      attemptCount: 3,
      generatedClipCount: 1,
      capacityBlockedAttemptCount: 2,
      localArtifact:
        "/home/ubuntu/reels_audit/reel_0003/REEL_0003_RETRIEVAL_PRACTICE_HI_V2_LOCAL.mp4 (59.571-second assembled source candidate using preserved Clip 01, local caption-free procedural fallback, V3 narration, and V4 short-cue captions; its final MP4 derivative is now exact-name verified in the private Drive package)",
      retryRecord: "automation/reels/REEL_0003_PRODUCTION_BLOCKER_2026-08-23.md",
    });
    expect(state.reels["0004"]).toMatchObject({
      status: "evidence-script-narration-local-visual-ready-confirmation-required",
      topic: "Spacing effect: a learning plan, not a magic calendar",
      researchStatus: "independently-verified",
      evidenceRecord: "automation/reels/REEL_0004_RESEARCH_DRAFT_2026-08-23.md",
      productionBlueprint: "automation/reels/REEL_0004_PRODUCTION_BLUEPRINT_2026-08-23.md",
      narrationTechnicalCheck: {
        record: "automation/reels/REEL_0004_NARRATION_TECHNICAL_CHECK_2026-08-23.md",
        format: "PCM s16le WAV, 24 kHz mono",
        durationSeconds: 60.12,
        storage: "local-only",
        status: "technically-readable-pending-visuals-captions-final-qa-and-private-package",
      },
      finalProductionGate: {
        record: "automation/reels/REEL_0004_FINAL_PRODUCTION_GATE_2026-08-24.md",
        status: "explicit-current-brief-confirmation-required",
        finalRenderAllowed: false,
        driveUploadAllowed: false,
        verifiedCountEligible: false,
      },
      releaseStatus: "not-complete",
      externalPublishingStatus: "not-published",
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

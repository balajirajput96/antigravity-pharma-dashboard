import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function readJson<T>(relativePath: string): T {
  return JSON.parse(readFileSync(resolve(process.cwd(), relativePath), "utf8")) as T;
}

type MasterState = {
  masterProgress: {
    target: number;
    verifiedCompleted: number;
    pending: number;
    failed: { count: number };
    retryQueue: unknown[];
    currentBatch: { id: string; verifiedCompleted: number; pending: number };
    artifactIndexes: Record<string, string>;
    lastInventory: {
      date: string;
      reconciliationRecord: string;
      candidateFolderInventory: string;
      candidateFolderCounts: {
        totalFolders: number;
        countedVerifiedPackages: number;
        unclassifiedCandidateFolders: number;
      };
      unclassifiedArtifactsRule: string;
    };
  };
  productionPolicy: {
    automaticBulkGeneration: boolean;
    automaticExternalPublishing: boolean;
  };
  scheduling: { status: string };
};

describe("reels master indexes", () => {
  it("keeps verified counts, Batch_001 records, and safety boundaries consistent", () => {
    const state = readJson<MasterState>("automation/reels/reels-continuation-state.json");
    const research = readJson<{
      recordCount: number;
      records: { reelId: string; usedStatus: string; reelPotential: string }[];
    }>("automation/reels/research-database-index.json");
    const assets = readJson<{
      entries: { reelId: string; packageStatus: string; narrationTechnicalIntegrity?: string }[];
    }>(
      "automation/reels/asset-index.json"
    );
    const quality = readJson<{ entries: { reelId: string; status: string }[] }>(
      "automation/reels/quality-control-index.json"
    );
    const errors = readJson<{ reelFailureCount: number; retryQueue: unknown[] }>(
      "automation/reels/error-retry-log.json"
    );
    const batches = readJson<{
      targetReels: number;
      batchSize: number;
      plannedBatchCount: number;
      currentBatch: string;
      batches: { id: string; verifiedCompleted: string[]; pendingCount: number }[];
    }>("automation/reels/batch-index.json");
    const candidateInventory = readJson<{
      candidateAudits: {
        displayFolderName: string;
        status: string;
        countedAsVerified: boolean;
        reelIdentifierCollision: string;
        releaseHoldReasons: string[];
      }[];
    }>("automation/reels/drive-candidate-folder-inventory.json");

    expect(state.masterProgress.target).toBe(3000);
    expect(state.masterProgress.verifiedCompleted).toBe(3);
    expect(state.masterProgress.pending).toBe(2997);
    expect(research.recordCount).toBe(4);
    expect(research.records.map(({ reelId }) => reelId)).toEqual(["0001", "0002", "0003", "0004"]);
    expect(
      research.records.filter(({ usedStatus }) => usedStatus === "used").map(({ reelId }) => reelId)
    ).toEqual(["0001", "0002", "0003"]);
    expect(
      research.records.find(({ reelId }) => reelId === "0003")
    ).toMatchObject({
      usedStatus: "used",
      reelPotential: "used-private-drive-verified-package",
    });
    expect(research.records.find(({ reelId }) => reelId === "0004")).toMatchObject({
      usedStatus: "not-yet-produced",
      reelPotential: "evidence-verified-not-yet-scripted",
    });
    expect(assets.entries.map(({ reelId }) => reelId)).toEqual(["0001", "0002", "0003"]);
    expect(quality.entries.map(({ reelId }) => reelId)).toEqual(["0001", "0002", "0003"]);
    expect(
      assets.entries
        .filter(({ packageStatus }) => packageStatus.startsWith("private-drive-verified"))
        .map(({ reelId }) => reelId)
    ).toEqual(["0001", "0002", "0003"]);
    expect(assets.entries.find(({ reelId }) => reelId === "0003")).toMatchObject({
      packageStatus: "private-drive-verified-review-ready",
    });
    expect(assets.entries.find(({ reelId }) => reelId === "0003")?.narrationTechnicalIntegrity).toContain(
      "47.440 seconds"
    );
    expect(quality.entries.every(({ status }) => status.startsWith("passed-private-drive-verified"))).toBe(true);
    expect(errors.reelFailureCount).toBe(state.masterProgress.failed.count);
    expect(errors.retryQueue).toHaveLength(state.masterProgress.retryQueue.length);
    expect(errors.retryQueue).toEqual([]);
    expect(state.masterProgress.retryQueue).toEqual([]);
    expect(batches).toMatchObject({
      targetReels: state.masterProgress.target,
      batchSize: 30,
      plannedBatchCount: 100,
      currentBatch: state.masterProgress.currentBatch.id,
    });
    expect(batches.batches[0]).toMatchObject({
      id: "Batch_001",
      verifiedCompleted: ["0001", "0002", "0003"],
      pendingCount: state.masterProgress.currentBatch.pending,
    });
    expect(state.masterProgress.artifactIndexes.errorRetryLog).toBe(
      "automation/reels/error-retry-log.json"
    );
    expect(state.masterProgress.lastInventory).toMatchObject({
      date: "2026-08-23",
      reconciliationRecord: "automation/reels/DRIVE_INVENTORY_RECONCILIATION_2026-08-23.md",
      candidateFolderInventory: "automation/reels/drive-candidate-folder-inventory.json",
      candidateFolderCounts: {
        totalFolders: 94,
        countedVerifiedPackages: 2,
        unclassifiedCandidateFolders: 92,
      },
    });
    expect(state.masterProgress.lastInventory.unclassifiedArtifactsRule).toContain(
      "independently validated"
    );
    expect(state.masterProgress.artifactIndexes.candidateFolderInventory).toBe(
      "automation/reels/drive-candidate-folder-inventory.json"
    );
    expect(candidateInventory.candidateAudits).toEqual([
      expect.objectContaining({
        displayFolderName: "Reel_0003",
        status: "unclassified-release-hold",
        countedAsVerified: false,
      }),
    ]);
    expect(candidateInventory.candidateAudits[0].reelIdentifierCollision).toContain("must not be merged");
    expect(candidateInventory.candidateAudits[0].releaseHoldReasons).toHaveLength(4);
    expect(state.productionPolicy.automaticBulkGeneration).toBe(false);
    expect(state.productionPolicy.automaticExternalPublishing).toBe(false);
    expect(state.scheduling.status).toBe("not-created");
  });
});

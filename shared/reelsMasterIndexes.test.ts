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
    const research = readJson<{ recordCount: number; records: { reelId: string }[] }>(
      "automation/reels/research-database-index.json"
    );
    const assets = readJson<{ entries: { reelId: string; packageStatus: string }[] }>(
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

    expect(state.masterProgress.target).toBe(3000);
    expect(state.masterProgress.verifiedCompleted).toBe(2);
    expect(state.masterProgress.pending).toBe(2998);
    expect(research.recordCount).toBe(state.masterProgress.verifiedCompleted);
    expect(research.records.map(({ reelId }) => reelId)).toEqual(["0001", "0002"]);
    expect(assets.entries.map(({ reelId }) => reelId)).toEqual(["0001", "0002"]);
    expect(quality.entries.map(({ reelId }) => reelId)).toEqual(["0001", "0002"]);
    expect(assets.entries.every(({ packageStatus }) => packageStatus.startsWith("private-drive-verified"))).toBe(true);
    expect(quality.entries.every(({ status }) => status.startsWith("passed-private-drive-verified"))).toBe(true);
    expect(errors.reelFailureCount).toBe(state.masterProgress.failed.count);
    expect(errors.retryQueue).toEqual(state.masterProgress.retryQueue);
    expect(batches).toMatchObject({
      targetReels: state.masterProgress.target,
      batchSize: 30,
      plannedBatchCount: 100,
      currentBatch: state.masterProgress.currentBatch.id,
    });
    expect(batches.batches[0]).toMatchObject({
      id: "Batch_001",
      verifiedCompleted: ["0001", "0002"],
      pendingCount: state.masterProgress.currentBatch.pending,
    });
    expect(state.masterProgress.artifactIndexes.errorRetryLog).toBe(
      "automation/reels/error-retry-log.json"
    );
    expect(state.productionPolicy.automaticBulkGeneration).toBe(false);
    expect(state.productionPolicy.automaticExternalPublishing).toBe(false);
    expect(state.scheduling.status).toBe("not-created");
  });
});

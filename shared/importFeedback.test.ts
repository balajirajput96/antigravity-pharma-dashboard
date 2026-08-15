import { describe, expect, it } from "vitest";
import { isFirstImportPending, shouldAnnounceFirstImport } from "./importFeedback";

describe("shouldAnnounceFirstImport", () => {
  it("announces only when a first run follows an empty workspace", () => {
    expect(shouldAnnounceFirstImport(null, 42, null)).toBe(true);
  });

  it("does not announce an already imported or subsequent run", () => {
    expect(shouldAnnounceFirstImport(undefined, 42, null)).toBe(false);
    expect(shouldAnnounceFirstImport(42, 43, null)).toBe(false);
    expect(shouldAnnounceFirstImport(null, 42, 42)).toBe(false);
  });
});

describe("isFirstImportPending", () => {
  it("keeps the progress feedback active only while the workspace has no run", () => {
    expect(isFirstImportPending(false, true, false)).toBe(true);
    expect(isFirstImportPending(false, false, true)).toBe(true);
    expect(isFirstImportPending(true, true, false)).toBe(false);
    expect(isFirstImportPending(true, false, true)).toBe(false);
  });
});

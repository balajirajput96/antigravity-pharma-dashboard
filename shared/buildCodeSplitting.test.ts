import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("production build code splitting", () => {
  it("keeps stable React, UI, and data dependency chunk groups configured", () => {
    const config = readFileSync(resolve(process.cwd(), "vite.config.ts"), "utf8");

    expect(config).toContain("codeSplitting");
    expect(config).toContain('name: "react-runtime"');
    expect(config).toContain('name: "ui-runtime"');
    expect(config).toContain('name: "data-runtime"');
    expect(config).toContain("@radix-ui");
    expect(config).toContain("@trpc");
  });
});

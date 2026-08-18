import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const templateDir = resolve(process.cwd(), "automation/gemini-workspace-template");

describe("Gemini workspace recovery template", () => {
  it("preserves the required research-only safety gates", () => {
    const instructions = readFileSync(resolve(templateDir, "GEMINI.md"), "utf8");
    const policy = readFileSync(resolve(templateDir, "gemini_pharma_safety.toml"), "utf8");
    const pnpmWorkspace = readFileSync(resolve(templateDir, "pnpm-workspace.yaml"), "utf8");

    expect(instructions).toContain("Never send an email");
    expect(instructions).toContain("Never submit a form");
    expect(instructions).toContain("no external action was taken");
    expect(instructions).toContain("direct user confirmation is required");
    expect(instructions).toContain("restore-gemini-workspace.sh");
    expect(instructions).toContain("pnpm run validate-safety");
    expect(instructions).toContain("existing Gemini authentication is unavailable");
    expect(instructions).toContain("Do not open, start, or guide any login flow");
    expect(instructions).toContain("/home/ubuntu/gemini_pharma");
    expect(policy).toContain('"email-send"');
    expect(policy).toContain('"form-submit"');
    expect(policy).toContain('"password-use"');
    expect(policy).toContain('"otp-use"');
    expect(policy).toContain('"captcha-bypass"');
    expect(policy).toContain('"external-outreach"');
    expect(pnpmWorkspace).toContain("'@github/keytar': false");
    expect(pnpmWorkspace).toContain("node-pty: false");
  });

  it("contains only non-secret recovery source files", () => {
    for (const filename of [
      "GEMINI.md",
      "gemini_pharma_safety.toml",
      "package.json",
      "pnpm-workspace.yaml",
      "validate_safety_policy.sh",
      "gemini_pharma",
    ]) {
      expect(existsSync(resolve(templateDir, filename))).toBe(true);
    }

    const launcher = readFileSync(resolve(templateDir, "gemini_pharma"), "utf8");
    expect(launcher).toContain('workspace="/home/ubuntu/agy_pharma_job_task"');
    expect(launcher).not.toContain("GEMINI_API_KEY=");
  });
});

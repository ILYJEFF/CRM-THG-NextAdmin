import { describe, expect, it } from "vitest";
import {
  formatJobOrderStatusLabel,
  formatSubmissionStageLabel,
  normalizeSubmissionStage,
  formatStatusLabel,
} from "../pipeline";

describe("pipeline labels", () => {
  it("formats job order status", () => {
    expect(formatJobOrderStatusLabel("sourcing")).toBe("Sourcing");
    expect(formatJobOrderStatusLabel("unknown_custom")).toBe("unknown_custom");
  });

  it("formats submission stage", () => {
    expect(formatSubmissionStageLabel("submitted_client")).toBe(
      "Submitted to client"
    );
  });

  it("normalizes submission stage", () => {
    expect(normalizeSubmissionStage("")).toBe("triage");
    expect(normalizeSubmissionStage("  interview  ")).toBe("interview");
  });

  it("formats talent status", () => {
    expect(formatStatusLabel("screening", "talent")).toBe("Screening");
  });
});

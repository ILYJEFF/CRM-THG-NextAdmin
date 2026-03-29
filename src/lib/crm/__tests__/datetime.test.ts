import { describe, expect, it } from "vitest";
import { CRM_TIME_ZONE, formatCrm } from "../datetime";

describe("formatCrm", () => {
  it("uses America/Chicago", () => {
    expect(CRM_TIME_ZONE).toBe("America/Chicago");
  });

  it("formats UTC noon as morning Central in January (CST)", () => {
    const utcNoon = new Date("2026-01-15T18:00:00.000Z");
    expect(formatCrm(utcNoon, "yyyy-MM-dd HH:mm")).toBe("2026-01-15 12:00");
  });
});

import { afterEach, describe, expect, it } from "vitest";
import { applyServerlessDbUrl } from "../database-url";

describe("applyServerlessDbUrl", () => {
  const savedEnv = process.env.NODE_ENV;
  const savedPoolOff = process.env.PRISMA_SERVERLESS_POOL_OFF;

  afterEach(() => {
    process.env.NODE_ENV = savedEnv;
    if (savedPoolOff === undefined) {
      delete process.env.PRISMA_SERVERLESS_POOL_OFF;
    } else {
      process.env.PRISMA_SERVERLESS_POOL_OFF = savedPoolOff;
    }
  });

  it("does not change URL in development", () => {
    process.env.NODE_ENV = "development";
    const input = "postgresql://u:p@h/db?connection_limit=5";
    expect(applyServerlessDbUrl(input)).toBe(input);
  });

  it("forces connection_limit=1 and pool_timeout=20 in production", () => {
    process.env.NODE_ENV = "production";
    const input =
      "postgresql://u:p@h/db?sslmode=require&connection_limit=5&pool_timeout=10";
    const out = applyServerlessDbUrl(input);
    expect(out).toMatch(/connection_limit=1/);
    expect(out).toMatch(/pool_timeout=20/);
    expect(out).not.toMatch(/connection_limit=5/);
    expect(out).not.toMatch(/pool_timeout=10/);
  });

  it("honors PRISMA_SERVERLESS_POOL_OFF=1", () => {
    process.env.NODE_ENV = "production";
    process.env.PRISMA_SERVERLESS_POOL_OFF = "1";
    const input = "postgresql://u:p@h/db?connection_limit=5";
    expect(applyServerlessDbUrl(input)).toBe(input);
  });
});

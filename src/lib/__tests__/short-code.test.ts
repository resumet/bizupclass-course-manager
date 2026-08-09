import { describe, expect, it } from "vitest";

import { generateShortCode, SHORT_CODE_LENGTH } from "../short-code";

describe("generateShortCode", () => {
  it("creates a six-character alphanumeric code", () => {
    for (let index = 0; index < 1_000; index += 1) {
      expect(generateShortCode()).toMatch(/^[A-Za-z0-9]{6}$/);
      expect(generateShortCode()).toHaveLength(SHORT_CODE_LENGTH);
    }
  });

  it("uses cryptographic randomness to produce varied values", () => {
    const codes = Array.from({ length: 100 }, generateShortCode);
    expect(new Set(codes).size).toBeGreaterThan(95);
  });
});

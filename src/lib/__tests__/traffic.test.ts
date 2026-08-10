import { describe, expect, it } from "vitest";

import { decodeLocationHeader, getTrafficPeriodStarts } from "../traffic";

describe("getTrafficPeriodStarts", () => {
  it("returns the current day and Monday boundaries in KST", () => {
    expect(getTrafficPeriodStarts(new Date("2026-08-09T23:30:00.000Z"))).toEqual({
      today: "2026-08-09T15:00:00.000Z",
      thisWeek: "2026-08-09T15:00:00.000Z",
    });
  });
});

describe("decodeLocationHeader", () => {
  it("decodes Vercel's encoded city header", () => {
    expect(decodeLocationHeader("Seoul%20City")).toBe("Seoul City");
  });
});

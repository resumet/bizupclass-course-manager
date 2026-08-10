import { describe, expect, it } from "vitest";

import { formatKoreanLiveSchedule } from "../client-api";

describe("formatKoreanLiveSchedule", () => {
  it("formats the live date, weekday, and time in KST", () => {
    expect(formatKoreanLiveSchedule("2024-08-20T10:30:00.000Z")).toBe("8월20일(화) 19:30");
  });

  it("returns null when no live date is set", () => {
    expect(formatKoreanLiveSchedule(null)).toBeNull();
  });
});

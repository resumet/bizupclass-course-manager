import { describe, expect, it } from "vitest";

import { getPreparationSummary, getTaskForecast } from "../course-preparation";

const baseTask = {
  status: "in_progress" as const,
  progress_percent: 50,
  start_date: "2026-10-01",
  due_date: "2026-11-10",
};

describe("course preparation forecast", () => {
  it("marks completed work as completed", () => {
    expect(getTaskForecast({ ...baseTask, status: "completed", progress_percent: 100 }, "2026-11-01")).toBe("completed");
  });

  it("marks overdue and blocked work as at risk", () => {
    expect(getTaskForecast({ ...baseTask, due_date: "2026-10-31" }, "2026-11-01")).toBe("at_risk");
    expect(getTaskForecast({ ...baseTask, status: "blocked" }, "2026-11-01")).toBe("at_risk");
  });

  it("compares actual progress with schedule progress", () => {
    expect(getTaskForecast({ ...baseTask, progress_percent: 85 }, "2026-11-01")).toBe("achievable");
    expect(getTaskForecast({ ...baseTask, progress_percent: 20 }, "2026-11-01")).toBe("at_risk");
  });

  it("calculates average progress and the most urgent overall forecast", () => {
    expect(getPreparationSummary([
      { ...baseTask, progress_percent: 100, status: "completed" },
      { ...baseTask, progress_percent: 20 },
    ], "2026-11-01")).toEqual({ progress: 60, forecast: "at_risk" });
  });
});

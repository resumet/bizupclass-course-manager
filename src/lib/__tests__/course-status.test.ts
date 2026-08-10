import { describe, expect, it } from "vitest";

import { isOngoingCourse, sortCoursesByStartDate } from "../course-status";
import type { Course, CourseStatus } from "../../types/database";

function course(id: string, webinarAt: string | null, status: CourseStatus = "preparing"): Course {
  return {
    id,
    title: id,
    instructor_name: null,
    webinar_at: webinarAt,
    opening_at: null,
    status,
    created_at: `2026-08-0${id.length}T00:00:00.000Z`,
    updated_at: "2026-08-10T00:00:00.000Z",
  };
}

describe("course status helpers", () => {
  it("sorts courses by webinar start and keeps unscheduled courses last", () => {
    const result = sortCoursesByStartDate([
      course("none", null),
      course("later", "2026-08-20T10:30:00.000Z"),
      course("first", "2026-08-10T10:30:00.000Z"),
    ]);

    expect(result.map(({ id }) => id)).toEqual(["first", "later", "none"]);
  });

  it("treats only preparing and confirmed courses as ongoing", () => {
    expect(isOngoingCourse(course("ready", null, "preparing"))).toBe(true);
    expect(isOngoingCourse(course("confirmed", null, "confirmed"))).toBe(true);
    expect(isOngoingCourse(course("ended", null, "ended"))).toBe(false);
    expect(isOngoingCourse(course("cancelled", null, "cancelled"))).toBe(false);
  });
});

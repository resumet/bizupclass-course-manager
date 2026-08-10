import { describe, expect, it } from "vitest";

import {
  createDefaultSharedResources,
  DEFAULT_SHARED_RESOURCE_URL,
} from "../shared-resource-defaults";

describe("createDefaultSharedResources", () => {
  it("creates the three requested resources with the BizUpClass URL", () => {
    expect(createDefaultSharedResources("course-1")).toEqual([
      {
        course_id: "course-1",
        name: "무료특강 자료 드라이브",
        resource_type: "Google Drive",
        url: DEFAULT_SHARED_RESOURCE_URL,
        sort_order: 0,
      },
      {
        course_id: "course-1",
        name: "유료강의 커리큘럼 시트",
        resource_type: "Google Sheets",
        url: DEFAULT_SHARED_RESOURCE_URL,
        sort_order: 1,
      },
      {
        course_id: "course-1",
        name: "무료 단톡방(1번) 주소",
        resource_type: "기타",
        url: DEFAULT_SHARED_RESOURCE_URL,
        sort_order: 2,
      },
    ]);
  });
});

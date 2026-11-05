import { describe, expect, it } from "vitest";

import { courseContentDocumentSchema } from "../validation";

describe("course content document validation", () => {
  it("preserves leading, trailing, repeated whitespace and blank lines", () => {
    const source = "  계약서 원문  \n\n제1조    목적\n  마지막 줄  ";

    expect(courseContentDocumentSchema.parse({ content: source }).content).toBe(source);
  });

  it("allows an empty source without substituting or trimming it", () => {
    expect(courseContentDocumentSchema.parse({ content: "" }).content).toBe("");
  });
});

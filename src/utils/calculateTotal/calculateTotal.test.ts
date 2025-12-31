import { describe, expect, it } from "vitest";

import { calculateTotal } from "@/utils";

describe("calculateTotal", () => {
  it("sums comma-separated numbers", () => {
    expect(calculateTotal("1,2,3")).toBe(6);
  });

  it("sums newline-separated numbers", () => {
    expect(calculateTotal("1\n2\n3")).toBe(6);
  });

  it("handles mixed separators and whitespace", () => {
    expect(calculateTotal(" 1, 2\n 3 ,4\n5 ")).toBe(15);
  });

  it("treats invalid/empty entries as 0", () => {
    expect(calculateTotal("1,foo,2, ,bar\n3")).toBe(6);
  });

  it("returns 0 for empty string", () => {
    expect(calculateTotal("")).toBe(0);
  });

  it("sums floating point numbers", () => {
    expect(calculateTotal("1.5,2.25,3.75")).toBeCloseTo(7.5);
  });

  it("handles negative numbers", () => {
    expect(calculateTotal("10,-2.5\n-1.5")).toBeCloseTo(6);
  });

  it("handles scientific notation", () => {
    expect(calculateTotal("1e3,2e2\n3e1")).toBeCloseTo(1230);
  });
});

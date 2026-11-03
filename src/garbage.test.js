import { describe, it, expect } from "vitest";
import { isGarbage } from "./garbage";

const row = [1, 2, 3, 0, 0, 4, 5, 6, 7, 1];

describe("isGarbage", () => {
  it("takes 1 to 4 rows with holes", () => {
    expect(isGarbage([row])).toBe(true);
    expect(isGarbage([row, row, row, row])).toBe(true);
  });

  it("refuses anything else", () => {
    expect(isGarbage([])).toBe(false);
    expect(isGarbage([row, row, row, row, row])).toBe(false);
    expect(isGarbage(row)).toBe(false);
    expect(isGarbage("rows")).toBe(false);
    expect(isGarbage([row.slice(1)])).toBe(false);
    // Full row
    expect(isGarbage([row.map((id) => id || 1)])).toBe(false);
    expect(isGarbage([row.with(0, 8)])).toBe(false);
    expect(isGarbage([row.with(0, -1)])).toBe(false);
    expect(isGarbage([row.with(0, 1.5)])).toBe(false);
    expect(isGarbage([row.with(0, "1")])).toBe(false);
  });
});

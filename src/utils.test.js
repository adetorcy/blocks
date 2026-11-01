import { describe, it, expect } from "vitest";
import { seededRandom, sequence } from "./utils";

// First n values of an iterator or a random function
function take(source, n) {
  const next =
    typeof source === "function" ? source : () => source.next().value;
  return Array.from({ length: n }, next);
}

describe("seededRandom", () => {
  it("gives the same numbers for the same seed", () => {
    expect(take(seededRandom(42), 100)).toEqual(take(seededRandom(42), 100));
  });

  it("gives different numbers for different seeds", () => {
    expect(take(seededRandom(1), 100)).not.toEqual(take(seededRandom(2), 100));
  });

  it("stays in [0, 1)", () => {
    for (const n of take(seededRandom(7), 10000)) {
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1);
    }
  });

  // Seeds come from crypto.getRandomValues, unsigned 32-bit
  it("takes any 32-bit seed", () => {
    expect(take(seededRandom(0xffffffff), 100)).toEqual(
      take(seededRandom(-1), 100),
    );
  });
});

describe("sequence", () => {
  it("gives the same pieces for the same seed", () => {
    const a = sequence(seededRandom(2026));
    const b = sequence(seededRandom(2026));
    expect(take(a, 1000)).toEqual(take(b, 1000));
  });

  it("gives every piece index, and only those", () => {
    const pieces = take(sequence(seededRandom(3)), 1000);
    expect(new Set(pieces)).toEqual(new Set([0, 1, 2, 3, 4, 5, 6]));
  });

  // NES rerolls once on a repeat (or 7): 2/8 × 1/7 = 1/28, not 1/7
  it("rarely repeats a piece", () => {
    const pieces = take(sequence(seededRandom(5)), 10000);
    const repeats = pieces.filter((piece, i) => piece === pieces[i - 1]);
    expect(repeats.length / pieces.length).toBeCloseTo(1 / 28, 2);
  });

  it("still works unseeded", () => {
    for (const piece of take(sequence(), 1000)) {
      expect(piece).toBeGreaterThanOrEqual(0);
      expect(piece).toBeLessThanOrEqual(6);
    }
  });
});

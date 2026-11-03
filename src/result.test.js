import { describe, it, expect } from "vitest";
import { matchResult, isEnd } from "./result";

const finish = (frame) => ({ frame, reason: "finish" });
const topOut = (frame) => ({ frame, reason: "topOut" });
const stop = (frame) => ({ frame, reason: "stop" });

describe("matchResult", () => {
  it("the first to finish wins", () => {
    expect(matchResult(finish(1000), stop(1000))).toEqual({
      outcome: "win",
      who: "you",
      reason: "finish",
    });
    expect(matchResult(finish(2000), finish(1000))).toEqual({
      outcome: "lose",
      who: "opponent",
      reason: "finish",
    });
  });

  it("the first to top out loses", () => {
    expect(matchResult(topOut(1000), stop(1000))).toEqual({
      outcome: "lose",
      who: "you",
      reason: "topOut",
    });
    expect(matchResult(topOut(2000), topOut(1000))).toEqual({
      outcome: "win",
      who: "opponent",
      reason: "topOut",
    });
  });

  it("a finish beats a top-out on the same frame", () => {
    expect(matchResult(finish(1000), topOut(1000)).outcome).toBe("win");
    expect(matchResult(topOut(1000), finish(1000)).outcome).toBe("lose");
  });

  it("the same end on the same frame is a draw", () => {
    const draw = (reason) => ({ outcome: "draw", who: "both", reason });
    expect(matchResult(finish(1000), finish(1000))).toEqual(draw("finish"));
    expect(matchResult(topOut(1000), topOut(1000))).toEqual(draw("topOut"));
  });

  it("one frame apart is not a draw", () => {
    expect(matchResult(finish(1001), finish(1000))).toEqual({
      outcome: "lose",
      who: "opponent",
      reason: "finish",
    });
    expect(matchResult(topOut(1000), topOut(1001))).toEqual({
      outcome: "lose",
      who: "you",
      reason: "topOut",
    });
  });

  it("gives both sides opposite results", () => {
    const opposite = { win: "lose", lose: "win", draw: "draw" };
    const ends = [finish, topOut].flatMap((end) =>
      [900, 999, 1000, 1001, 1100].map(end),
    );
    for (const a of ends) {
      for (const b of ends) {
        expect(matchResult(b, a).outcome).toBe(
          opposite[matchResult(a, b).outcome],
        );
      }
    }
  });
});

describe("isEnd", () => {
  it("takes a frame and a reason", () => {
    expect(isEnd(finish(0))).toBe(true);
    expect(isEnd(stop(1060))).toBe(true);
  });

  it("refuses anything else", () => {
    expect(isEnd({ frame: -1, reason: "finish" })).toBe(false);
    expect(isEnd({ frame: 1.5, reason: "finish" })).toBe(false);
    expect(isEnd({ frame: "10", reason: "finish" })).toBe(false);
    expect(isEnd({ frame: 10, reason: "quit" })).toBe(false);
    expect(isEnd({ frame: 10 })).toBe(false);
  });
});

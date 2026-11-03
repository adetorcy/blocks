import { describe, it, expect } from "vitest";
import { matchResult, isEnd } from "./result";
import { DRAW_FRAMES } from "./constants";

const finish = (frame) => ({ frame, reason: "finish" });
const topOut = (frame) => ({ frame, reason: "topOut" });
const stop = (frame) => ({ frame, reason: "stop" });

describe("matchResult", () => {
  it("the first to finish wins", () => {
    expect(matchResult(finish(1000), stop(1000 + DRAW_FRAMES))).toEqual({
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
    expect(matchResult(topOut(1000), stop(1000 + DRAW_FRAMES))).toEqual({
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

  it("a finish beats a top-out even within DRAW_FRAMES", () => {
    expect(matchResult(finish(1010), topOut(1000)).outcome).toBe("win");
    expect(matchResult(topOut(1000), finish(1010)).outcome).toBe("lose");
    expect(matchResult(topOut(1000), finish(1000)).outcome).toBe("lose");
  });

  it("the same end within DRAW_FRAMES is a draw", () => {
    const draw = (reason) => ({ outcome: "draw", who: "both", reason });
    expect(matchResult(finish(1000), finish(1000 + DRAW_FRAMES))).toEqual(
      draw("finish"),
    );
    expect(matchResult(topOut(1000 + DRAW_FRAMES), topOut(1000))).toEqual(
      draw("topOut"),
    );
    expect(matchResult(topOut(1000), topOut(1000 + DRAW_FRAMES + 1))).toEqual({
      outcome: "lose",
      who: "you",
      reason: "topOut",
    });
  });

  it("gives both sides opposite results", () => {
    const opposite = { win: "lose", lose: "win", draw: "draw" };
    const ends = [finish, topOut].flatMap((end) =>
      [900, 960, 961, 1000, 1040, 1060, 1061].map(end),
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

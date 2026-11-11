import { describe, expect, test } from "vitest";
import { centeredLeft, filledLines } from "./text";

describe("centeredLeft", () => {
  // Set offsets from style.css, checked by eye in the mockup
  test("matches the set labels", () => {
    expect(centeredLeft("2P GAME")).toBe(256);
    expect(centeredLeft("WAITING FOR PLAYER 2...")).toBe(152);
    expect(centeredLeft("SEND THEM THIS LINK:")).toBe(168);
    expect(centeredLeft("CAN'T CONNECT")).toBe(220);
  });

  test("names", () => {
    expect(centeredLeft("VS SAM")).toBe(264);
    expect(centeredLeft("VS WWWWWWWWWWWW")).toBe(148);
  });

  // The 2P result window's middle
  test("another middle", () => {
    expect(centeredLeft("TOPPED OUT", 204)).toBe(128);
    expect(centeredLeft("REACHED 100 LINES", 204)).toBe(80);
    expect(centeredLeft("WWWWWWWWWWWW", 204)).toBe(60);
  });
});

describe("filledLines", () => {
  const link =
    "https://adetorcy.github.io/blocks/#r=Ab3_kQ9-xZ2m&p=Ht7_qLm2-Rx9Kp3vN8wQzA";

  // The waiting screen's field, 3 lines as in the mockup
  test("fills each line to the width", () => {
    expect(filledLines(link, 464)).toEqual([
      "https://adetorcy.github.io/blocks/",
      "#r=Ab3_kQ9-xZ2m&p=Ht7_qLm2-R",
      "x9Kp3vN8wQzA",
    ]);
  });

  test("keeps every character", () => {
    expect(filledLines(link, 464).join("")).toBe(link);
    expect(filledLines(link, 40).join("")).toBe(link);
  });

  // The 4px spacing column after the last letter doesn't count
  test("ink only", () => {
    expect(filledLines("AAA", 44)).toEqual(["AAA"]);
    expect(filledLines("AAA", 40)).toEqual(["AA", "A"]);
  });

  test("one character per line at most when nothing fits", () => {
    expect(filledLines("MM", 4)).toEqual(["M", "M"]);
  });
});

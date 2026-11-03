import { describe, expect, test } from "vitest";
import { centeredLeft } from "./text";

describe("centeredLeft", () => {
  // Set offsets from style.css, checked by eye in the mockup
  test("matches the set labels", () => {
    expect(centeredLeft("2P GAME")).toBe(256);
    expect(centeredLeft("SEND THE LINK")).toBe(220);
    expect(centeredLeft("TO PLAYER 2")).toBe(232);
    expect(centeredLeft("WAITING...")).toBe(248);
    expect(centeredLeft("CAN'T CONNECT")).toBe(220);
  });

  test("names", () => {
    expect(centeredLeft("VS SAM")).toBe(264);
    expect(centeredLeft("VS WWWWWWWWWWWW")).toBe(148);
  });
});

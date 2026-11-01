import { describe, it, expect } from "vitest";
import { cleanName, NAME_LENGTH } from "./name";

describe("cleanName", () => {
  it("keeps letters, digits, spaces, underscores and dashes", () => {
    expect(cleanName("Alex")).toBe("Alex");
    expect(cleanName("x_y-z 99")).toBe("x_y-z 99");
  });

  it("trims spaces and turns runs of them into one", () => {
    expect(cleanName("  Alex   B  ")).toBe("Alex B");
  });

  it("drops every other character", () => {
    expect(cleanName("Zoë!")).toBe("Zo");
    expect(cleanName("<b>hi</b>")).toBe("bhib");
    expect(cleanName("a\tb\nc")).toBe("abc");
  });

  it("cuts at NAME_LENGTH", () => {
    expect(NAME_LENGTH).toBe(12);
    expect(cleanName("abcdefghijklmnop")).toBe("abcdefghijkl");
  });

  // Cut right after a space
  it("leaves no space at the end after the cut", () => {
    expect(cleanName("abcdefghijk lmn")).toBe("abcdefghijk");
  });

  it("gives an empty name when nothing is left", () => {
    expect(cleanName("")).toBe("");
    expect(cleanName("   ")).toBe("");
    expect(cleanName("!?")).toBe("");
  });

  // Storage gives null when empty
  // The network can send anything
  it("gives an empty name for anything but a string", () => {
    expect(cleanName(null)).toBe("");
    expect(cleanName(undefined)).toBe("");
    expect(cleanName(42)).toBe("");
    expect(cleanName({ name: "Alex" })).toBe("");
  });
});

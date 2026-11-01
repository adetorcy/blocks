import { describe, it, expect } from "vitest";
import { newRoom, roomLink, readRoomLink, isMessage } from "./transport";

const PAGE = "https://adetorcy.github.io/blocks/";

describe("room link", () => {
  it("gives a new room ID and password each time", () => {
    const a = newRoom();
    const b = newRoom();
    expect(a.roomId).toMatch(/^[\w-]{12}$/);
    expect(a.password).toMatch(/^[\w-]{22}$/);
    expect(a.roomId).not.toBe(b.roomId);
    expect(a.password).not.toBe(b.password);
  });

  it("puts the room in the # fragment and reads it back", () => {
    const room = newRoom();
    const link = new URL(roomLink(room, PAGE));

    expect(link.origin + link.pathname).toBe(PAGE);
    expect(link.search).toBe("");
    expect(readRoomLink(link.hash)).toEqual(room);
  });

  // The page's own fragment is replaced
  it("replaces any fragment already there", () => {
    const room = newRoom();
    const link = new URL(roomLink(room, PAGE + "#old"));
    expect(readRoomLink(link.hash)).toEqual(room);
  });

  it("gives null for anything else", () => {
    const { roomId, password } = newRoom();
    expect(readRoomLink("")).toBeNull();
    expect(readRoomLink("#")).toBeNull();
    expect(readRoomLink(`#r=${roomId}`)).toBeNull();
    expect(readRoomLink(`#r=${roomId}&p=${password.slice(1)}`)).toBeNull();
    expect(readRoomLink(`#r=${roomId}!&p=${password}`)).toBeNull();
  });
});

describe("isMessage", () => {
  it("takes plain objects with a string type", () => {
    expect(isMessage({ type: "start" })).toBe(true);
    expect(isMessage({ type: "board", cells: [0, 1] })).toBe(true);
  });

  it("refuses anything else", () => {
    expect(isMessage(null)).toBe(false);
    expect(isMessage("start")).toBe(false);
    expect(isMessage([{ type: "start" }])).toBe(false);
    expect(isMessage({})).toBe(false);
    expect(isMessage({ type: 1 })).toBe(false);
  });
});

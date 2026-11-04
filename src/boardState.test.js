import { describe, it, expect } from "vitest";
import Game from "./game";
import PIECES from "./pieces";
import { COLUMNS, PLAYFIELD_ROWS } from "./constants";
import { boardCells, isBoardState, JAMMED } from "./boardState";

// Endless O pieces
function* repeatO() {
  while (true) yield 1;
}

const O_ID = PIECES[1].id;
const SIZE = PLAYFIELD_ROWS * COLUMNS;

// Visible cells holding a block, as [column, row] (row 0 is the top visible row)
function filled(cells) {
  return [...cells].flatMap((digit, i) =>
    digit === "0" ? [] : [[i % COLUMNS, Math.floor(i / COLUMNS)]],
  );
}

describe("boardCells", () => {
  it("is the visible board with the live piece in it", () => {
    const game = new Game(() => {}, { pieceSequence: repeatO() });
    const piece = game.livePiece;
    const visible = piece.positions
      .map(([x, y]) => [piece.column + x, piece.row + y - 2])
      .filter(([, row]) => row >= 0);

    const cells = boardCells(game);

    // The O spawns on the top 2 visible rows
    expect(visible).toHaveLength(4);
    expect(cells).toHaveLength(SIZE);
    expect(filled(cells)).toEqual(visible);
    for (const [x, row] of visible) {
      expect(cells[row * COLUMNS + x]).toBe(String(O_ID));
    }
  });

  it("shows locked blocks once the piece is gone", () => {
    const game = new Game(() => {}, { pieceSequence: repeatO() });

    game.press("hardDrop");
    const cells = boardCells(game);

    expect(game.livePiece).toBeNull();
    expect(filled(cells)).toEqual([
      [4, PLAYFIELD_ROWS - 2],
      [5, PLAYFIELD_ROWS - 2],
      [4, PLAYFIELD_ROWS - 1],
      [5, PLAYFIELD_ROWS - 1],
    ]);
    expect(cells.at(-5)).toBe(String(O_ID));
  });

  it("shows the piece that topped out as jammed", () => {
    const game = new Game(() => {}, { pieceSequence: repeatO() });

    // O pieces stack up in the middle until one can't spawn
    for (let i = 0; i < 1000 && !game.gameOver; i++) {
      if (game.livePiece) game.press("hardDrop");
      game.frame();
    }
    const cells = boardCells(game);

    // The jammed O sits on the top 2 visible rows, over the stack
    expect(game.gameOver).toBe(true);
    for (const [x, row] of [
      [4, 0],
      [5, 0],
      [4, 1],
      [5, 1],
    ]) {
      expect(cells[row * COLUMNS + x]).toBe(String(JAMMED));
    }
    expect(cells[2 * COLUMNS + 4]).toBe(String(O_ID));
    expect(isBoardState({ cells, lines: 0, level: 0 })).toBe(true);
  });
});

describe("isBoardState", () => {
  const cells = "0".repeat(SIZE - 1) + "7";

  it("takes a full board and counts", () => {
    expect(isBoardState({ cells, lines: 12, level: 1 })).toBe(true);
  });

  it("refuses anything else", () => {
    expect(isBoardState({ cells: cells.slice(1), lines: 0, level: 0 })).toBe(
      false,
    );
    expect(
      isBoardState({ cells: cells.slice(1) + "9", lines: 0, level: 0 }),
    ).toBe(false);
    expect(isBoardState({ cells: [...cells], lines: 0, level: 0 })).toBe(false);
    expect(isBoardState({ cells, lines: -1, level: 0 })).toBe(false);
    expect(isBoardState({ cells, lines: 0, level: 1.5 })).toBe(false);
    expect(isBoardState({ cells, lines: "3", level: 0 })).toBe(false);
    expect(isBoardState({ cells })).toBe(false);
  });
});

import { describe, it, expect, beforeAll } from "vitest";
import Game from "./game";
import {
  COLUMNS,
  ROWS,
  GRAVITY_TABLE,
  ARE,
  DAS_DELAY,
  DAS_FRAMES,
} from "./constants";

/**
 * Test setup
 **/

// Browser API still used by Game, stubbed for Node
beforeAll(() => {
  globalThis.dispatchEvent = () => {}; // broadcast()
});

// Piece indices in PIECES
const I = 0;
const O = 1;

// Endless piece sequence repeating the given indices
function* repeat(...indices) {
  while (true) yield* indices;
}

// New game recording sounds in game.sounds
function newGame({ level = 0, pieces = repeat(O) } = {}) {
  const sounds = [];
  const game = new Game((name) => sounds.push(name), level, pieces);
  game.sounds = sounds;
  return game;
}

// Run n frames
function frames(game, n) {
  for (let i = 0; i < n; i++) game.frame();
}

// Run frames until condition is true, return how many it took
function framesUntil(game, condition, max = 1000) {
  for (let n = 1; n <= max; n++) {
    game.frame();
    if (condition()) return n;
  }
  throw new Error(`condition not met after ${max} frames`);
}

// Fill whole rows, leaving holes in the given columns
function fillRows(game, rows, holes = []) {
  for (const row of rows) {
    for (let column = 0; column < COLUMNS; column++) {
      if (!holes.includes(column)) game.board[row * COLUMNS + column] = 9;
    }
  }
  game.setGhostPiece();
}

function cell(game, column, row) {
  return game.board[row * COLUMNS + column];
}

const BOTTOM = ROWS - 1;

/**
 * Tests
 **/

describe("gravity", () => {
  it.each([0, 10, 19, 29])("level %i drops on schedule", (level) => {
    const game = newGame({ level });
    const row = game.livePiece.row;

    const n = framesUntil(game, () => game.livePiece.row !== row);

    expect(n).toBe(GRAVITY_TABLE[level]);
  });
});

describe("hard drop", () => {
  it("locks the piece on the ghost piece row", () => {
    const game = newGame(); // O piece, columns 4-5
    const ghostRow = game.ghostPieceRow;

    game.onkeydown("Space");

    expect(game.livePiece).toBeNull();
    expect(ghostRow).toBe(BOTTOM - 2);
    expect(cell(game, 4, BOTTOM)).toBe(2);
    expect(cell(game, 5, BOTTOM - 1)).toBe(2);
    expect(game.sounds).toEqual(["lock"]);
  });

  it("spawns the next piece after ARE frames", () => {
    const game = newGame();

    game.onkeydown("Space");
    const n = framesUntil(game, () => game.livePiece !== null);

    expect(n).toBe(ARE[BOTTOM]);
  });
});

describe("DAS", () => {
  it("shifts once, waits DAS_DELAY, then shifts every DAS_FRAMES", () => {
    const game = newGame(); // O piece at column 3, blocks in columns 4-5
    const column = game.livePiece.column;

    // Immediate shift on key press
    game.onkeydown("ArrowLeft");
    expect(game.livePiece.column).toBe(column - 1);

    // Initial delay
    frames(game, DAS_DELAY - 1);
    expect(game.livePiece.column).toBe(column - 1);
    frames(game, 1);
    expect(game.livePiece.column).toBe(column - 2);

    // Repeat rate
    frames(game, DAS_FRAMES);
    expect(game.livePiece.column).toBe(column - 3);
    frames(game, DAS_FRAMES);
    expect(game.livePiece.column).toBe(column - 4); // Against the left wall

    // Wall stops it
    frames(game, DAS_FRAMES * 3);
    expect(game.livePiece.column).toBe(column - 4);
    expect(game.sounds).toEqual(["tap", "tap", "tap", "tap"]);
  });

  it("stops on key release", () => {
    const game = newGame();
    const column = game.livePiece.column;

    game.onkeydown("ArrowRight");
    game.keyup("ArrowRight");
    frames(game, DAS_DELAY * 2);

    expect(game.livePiece.column).toBe(column + 1);
  });
});

describe("line clears", () => {
  it("scores a double and removes the lines", () => {
    const game = newGame();
    fillRows(game, [BOTTOM - 1, BOTTOM], [4, 5]); // Room for the O piece

    game.onkeydown("Space");

    expect(game.sounds).toEqual(["clear"]);
    expect(game.lines).toBe(2);
    expect(game.score).toBe(100);

    // After the line clear animation the next piece spawns on an empty board
    framesUntil(game, () => game.livePiece !== null);
    expect(game.board.every((id) => id === 0)).toBe(true);
  });

  it("scores a tetris times level + 1", () => {
    const game = newGame({ level: 3, pieces: repeat(I) });
    fillRows(game, [BOTTOM - 3, BOTTOM - 2, BOTTOM - 1, BOTTOM], [5]);

    game.onkeydown("KeyX"); // Vertical I piece in column 5
    game.onkeydown("Space");

    expect(game.sounds).toEqual(["tap", "clear4"]);
    expect(game.lines).toBe(4);
    expect(game.score).toBe(1200 * 4);
  });
});

describe("level up", () => {
  // https://tetris.wiki/Tetris_(NES,_Nintendo)
  it.each([
    [0, 10],
    [5, 60],
    [9, 100],
    [15, 100],
    [16, 110],
    [19, 140],
  ])("starting at level %i, first level up at %i lines", (level, lines) => {
    expect(newGame({ level }).nextLevelUp).toBe(lines);
  });

  it("speeds up gravity when reaching the line threshold", () => {
    const game = newGame();
    game.lines = 8;
    fillRows(game, [BOTTOM - 1, BOTTOM], [4, 5]);

    game.onkeydown("Space");

    expect(game.level).toBe(1);
    expect(game.delay).toBe(GRAVITY_TABLE[1]);
    expect(game.nextLevelUp).toBe(20);
    expect(game.sounds).toEqual(["clear", "levelUp"]);
  });
});

describe("game over", () => {
  it("ends when the next piece can't spawn", () => {
    const game = newGame();
    // Stack up to just below the spawn area, no full lines
    fillRows(game, Array.from({ length: ROWS - 4 }, (_, i) => i + 4), [0]);

    game.onkeydown("Space"); // Locks in the spawn area
    framesUntil(game, () => game.gameOver);

    expect(game.livePiece).not.toBeNull(); // Jammed piece
    expect(game.sounds).toEqual(["lock", "buzz"]);
  });
});

describe("snapshot", () => {
  it("starts with the starting level", () => {
    expect(newGame({ level: 5 }).getSnapshot()).toEqual({
      score: 0,
      lines: 0,
      level: 5,
      gameOver: false,
    });
  });

  it("notifies subscribers on line clear with a new snapshot", () => {
    const game = newGame({ level: 8 });
    fillRows(game, [BOTTOM - 1, BOTTOM], [4, 5]);
    const before = game.getSnapshot();
    let calls = 0;
    game.subscribe(() => calls++);

    game.onkeydown("Space");

    expect(calls).toBe(1);
    expect(game.getSnapshot()).not.toBe(before);
    expect(game.getSnapshot()).toEqual({
      score: 900,
      lines: 2,
      level: 8,
      gameOver: false,
    });
  });

  // useSyncExternalStore re-renders forever if the snapshot changes on every call
  it("keeps the same object while nothing changes", () => {
    const game = newGame();
    const snapshot = game.getSnapshot();
    let calls = 0;
    game.subscribe(() => calls++);

    game.onkeydown("ArrowLeft");
    game.onkeydown("Space"); // Lock without line clear
    frames(game, 100);

    expect(calls).toBe(0);
    expect(game.getSnapshot()).toBe(snapshot);
  });

  it("stops notifying after unsubscribe", () => {
    const game = newGame();
    fillRows(game, [BOTTOM], [4, 5]);
    let calls = 0;
    const unsubscribe = game.subscribe(() => calls++);

    unsubscribe();
    game.onkeydown("Space");

    expect(calls).toBe(0);
    expect(game.getSnapshot().lines).toBe(1);
  });

  it("reports game over", () => {
    const game = newGame();
    fillRows(game, Array.from({ length: ROWS - 4 }, (_, i) => i + 4), [0]);
    let calls = 0;
    game.subscribe(() => calls++);

    game.onkeydown("Space");
    framesUntil(game, () => game.gameOver);

    expect(calls).toBe(1);
    expect(game.getSnapshot().gameOver).toBe(true);
  });
});

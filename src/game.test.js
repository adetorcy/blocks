import { describe, it, expect } from "vitest";
import Game from "./game";
import {
  COLUMNS,
  ROWS,
  GRAVITY_TABLE,
  ARE,
  DAS_DELAY,
  DAS_FRAMES,
  LINE_CLEAR_STEP_FRAMES,
} from "./constants";

/**
 * Test setup
 **/

// Piece indices in PIECES
const I = 0;
const O = 1;

// Endless piece sequence repeating the given indices
function* repeat(...indices) {
  while (true) yield* indices;
}

// New game recording game events in game.gameEvents
// And the rows of each garbage event in game.garbage
function newGame({ level = 0, pieces = repeat(O), targetLines } = {}) {
  const gameEvents = [];
  const garbage = [];
  const game = new Game(
    (name, rows) => {
      gameEvents.push(name);
      if (name === "garbage") garbage.push(rows);
    },
    { level, pieceSequence: pieces, targetLines },
  );
  game.gameEvents = gameEvents;
  game.garbage = garbage;
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
    const game = newGame(); // O piece in columns 4-5
    const ghostRow = game.ghostPieceRow;

    game.press("hardDrop");

    expect(game.livePiece).toBeNull();
    expect(ghostRow).toBe(BOTTOM - 2);
    expect(cell(game, 4, BOTTOM)).toBe(2);
    expect(cell(game, 5, BOTTOM - 1)).toBe(2);
    expect(game.gameEvents).toEqual(["hardDrop", "lock"]);
  });

  it("spawns the next piece after ARE frames", () => {
    const game = newGame();

    game.press("hardDrop");
    const n = framesUntil(game, () => game.livePiece !== null);

    expect(n).toBe(ARE[BOTTOM]);
  });

  it("does nothing without a live piece", () => {
    const game = newGame();

    game.press("hardDrop");
    game.press("hardDrop"); // During ARE

    expect(game.gameEvents).toEqual(["hardDrop", "lock"]);
  });
});

describe("DAS", () => {
  it("shifts once, waits DAS_DELAY, then shifts every DAS_FRAMES", () => {
    const game = newGame(); // O piece at column 3, blocks in columns 4-5
    const column = game.livePiece.column;

    // Immediate shift on press
    game.press("moveLeft");
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
    expect(game.gameEvents).toEqual(["move", "move", "move", "move"]);
  });

  it("stops on release", () => {
    const game = newGame();
    const column = game.livePiece.column;

    game.press("moveRight");
    game.release("moveRight");
    frames(game, DAS_DELAY * 2);

    expect(game.livePiece.column).toBe(column + 1);
  });
});

describe("line clears", () => {
  it("scores a double and removes the lines", () => {
    const game = newGame();
    fillRows(game, [BOTTOM - 1, BOTTOM], [4, 5]); // Room for the O piece

    game.press("hardDrop");

    expect(game.gameEvents).toEqual(["hardDrop", "lineClear", "garbage"]);
    expect(game.getSnapshot()).toMatchObject({ score: 100, lines: 2 });

    // After the line clear animation the next piece spawns on an empty board
    framesUntil(game, () => game.livePiece !== null);
    expect(game.board.every((id) => id === 0)).toBe(true);
    expect(game.gameEvents).toEqual([
      "hardDrop",
      "lineClear",
      "garbage",
      "stackDrop",
    ]);
  });

  it("drops the stack when the animation ends", () => {
    const game = newGame();
    fillRows(game, [BOTTOM], [4, 5]);

    game.press("hardDrop");
    const n = framesUntil(game, () => game.gameEvents.includes("stackDrop"));

    // 5 animation steps, then one more step before the rows are removed
    expect(n).toBe(6 * LINE_CLEAR_STEP_FRAMES);
  });

  it("spawns the next piece ARE frames after the stack drops", () => {
    const game = newGame();
    fillRows(game, [BOTTOM], [4, 5]);

    game.press("hardDrop");
    framesUntil(game, () => game.gameEvents.includes("stackDrop"));
    const n = framesUntil(game, () => game.livePiece !== null);

    // ARE from the lock height, as without a line clear
    expect(n).toBe(ARE[BOTTOM]);
  });

  it("scores a tetris times level + 1", () => {
    const game = newGame({ level: 3, pieces: repeat(I) });
    fillRows(game, [BOTTOM - 3, BOTTOM - 2, BOTTOM - 1, BOTTOM], [5]);

    game.press("rotateRight"); // Vertical I piece in column 5
    game.press("hardDrop");

    expect(game.gameEvents).toEqual([
      "rotate",
      "hardDrop",
      "tetris",
      "garbage",
    ]);
    expect(game.getSnapshot()).toMatchObject({ score: 1200 * 4, lines: 4 });
  });
});

// A row of 9s like fillRows with holes in the given columns
const row = (...holes) =>
  Array.from({ length: COLUMNS }, (_, column) =>
    holes.includes(column) ? 0 : 9,
  );

// Garbage pushed in right away as if the next piece had spawned
function pushGarbageNow(game, rows) {
  game.receiveGarbage(rows);
  game.pushGarbage();
  game.setGhostPiece();
}

function boardRow(game, rowIdx) {
  return Array.from(
    game.board.subarray(rowIdx * COLUMNS, (rowIdx + 1) * COLUMNS),
  );
}

describe("garbage", () => {
  it("sends nothing for a single", () => {
    const game = newGame();
    fillRows(game, [BOTTOM], [4, 5]);

    game.press("hardDrop");

    expect(game.gameEvents).toEqual(["hardDrop", "lineClear"]);
  });

  it("sends the bottom row of a double, without the piece", () => {
    const game = newGame(); // O piece in columns 4-5
    fillRows(game, [BOTTOM - 1, BOTTOM], [4, 5]);

    game.press("hardDrop");

    expect(game.garbage).toEqual([[row(4, 5)]]);
  });

  it("sends the bottom 2 rows of a triple, top to bottom", () => {
    const game = newGame({ pieces: repeat(I) });
    fillRows(game, [BOTTOM - 2, BOTTOM - 1, BOTTOM], [5]);
    fillRows(game, [BOTTOM - 3], [4, 5]); // Not cleared
    game.board[(BOTTOM - 2) * COLUMNS] = 1; // Cleared, not sent
    game.board[(BOTTOM - 1) * COLUMNS] = 2; // Sent first

    game.press("rotateRight"); // Vertical I piece in column 5
    game.press("hardDrop");

    const sent = [row(5), row(5)];
    sent[0][0] = 2;
    expect(game.garbage).toEqual([sent]);
  });

  it("sends all 4 rows of a tetris, top to bottom", () => {
    const game = newGame({ pieces: repeat(I) });
    fillRows(game, [BOTTOM - 3, BOTTOM - 2, BOTTOM - 1, BOTTOM], [5]);
    game.board[(BOTTOM - 3) * COLUMNS] = 1; // Top row

    game.press("rotateRight");
    game.press("hardDrop");

    const sent = [row(5), row(5), row(5), row(5)];
    sent[0][0] = 1;
    expect(game.garbage).toEqual([sent]);
  });
});

describe("garbage in", () => {
  it("waits for the next spawn", () => {
    const game = newGame(); // O piece in columns 4-5

    game.receiveGarbage([row(0)]);
    expect(game.board.every((id) => id === 0)).toBe(true);

    game.press("hardDrop"); // Locks on the bottom 2 rows
    framesUntil(game, () => game.livePiece !== null);

    // Garbage at the bottom and the O piece one row up
    expect(boardRow(game, BOTTOM)).toEqual(row(0));
    expect(cell(game, 4, BOTTOM - 1)).toBe(2);
    expect(cell(game, 4, BOTTOM - 2)).toBe(2);
    expect(cell(game, 4, BOTTOM - 3)).toBe(0);
    expect(game.garbageHeight).toBe(1);
  });

  it("puts the latest attack at the bottom", () => {
    const game = newGame();
    const first = row(1);
    const second = [row(2), row(3)];

    game.receiveGarbage([first]);
    game.receiveGarbage(second);
    game.press("hardDrop");
    framesUntil(game, () => game.livePiece !== null);

    expect(boardRow(game, BOTTOM - 2)).toEqual(first);
    expect(boardRow(game, BOTTOM - 1)).toEqual(second[0]);
    expect(boardRow(game, BOTTOM)).toEqual(second[1]);
    expect(game.garbageHeight).toBe(3);
  });

  it("doesn't count cleared garbage rows toward lines", () => {
    const game = newGame(); // O piece in columns 4-5
    pushGarbageNow(game, [row(4, 5), row(4, 5)]);

    game.press("hardDrop");

    // Score, sound and garbage sent as for any double
    expect(game.gameEvents).toEqual(["hardDrop", "lineClear", "garbage"]);
    expect(game.getSnapshot()).toMatchObject({ score: 100, lines: 0 });
    expect(game.garbageHeight).toBe(0);
  });

  it("counts only the rows that aren't garbage", () => {
    const game = newGame();
    pushGarbageNow(game, [row(4, 5)]);
    fillRows(game, [BOTTOM - 1], [4, 5]); // Not garbage

    game.press("hardDrop");

    expect(game.getSnapshot()).toMatchObject({ score: 100, lines: 1 });
    expect(game.garbageHeight).toBe(0);
  });

  it("keeps garbage rows marked after a clear above them", () => {
    const game = newGame();
    pushGarbageNow(game, [row(0)]);
    fillRows(game, [BOTTOM - 2, BOTTOM - 1], [4, 5]); // Not garbage

    game.press("hardDrop");
    framesUntil(game, () => game.gameEvents.includes("stackDrop"));

    expect(game.getSnapshot().lines).toBe(2);
    expect(boardRow(game, BOTTOM)).toEqual(row(0));
    expect(game.garbageHeight).toBe(1);
  });

  it("ends the game when the stack is pushed into the spawn area", () => {
    const game = newGame();
    // Stack up to row 6 with no full lines
    fillRows(
      game,
      Array.from({ length: ROWS - 6 }, (_, i) => i + 6),
      [0],
    );

    game.press("hardDrop"); // Locks on rows 4-5 just below the spawn area
    game.receiveGarbage([row(0), row(0)]); // Pushes it into the spawn area
    framesUntil(game, () => game.gameOver);

    expect(game.gameEvents).toEqual(["hardDrop", "lock", "gameOver"]);
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
    game.lines = 8; // Skip ahead, internal field
    fillRows(game, [BOTTOM - 1, BOTTOM], [4, 5]);

    game.press("hardDrop");

    expect(game.getSnapshot()).toMatchObject({ lines: 10, level: 1 });
    expect(game.delay).toBe(GRAVITY_TABLE[1]);
    expect(game.nextLevelUp).toBe(20);
    expect(game.gameEvents).toEqual([
      "hardDrop",
      "lineClear",
      "levelUp",
      "garbage",
    ]);
  });
});

describe("game over", () => {
  it("ends when the next piece can't spawn", () => {
    const game = newGame();
    // Stack up to just below the spawn area with no full lines
    fillRows(
      game,
      Array.from({ length: ROWS - 4 }, (_, i) => i + 4),
      [0],
    );

    game.press("hardDrop"); // Locks in the spawn area
    framesUntil(game, () => game.getSnapshot().gameOver);

    expect(game.livePiece).not.toBeNull(); // Jammed piece
    expect(game.gameEvents).toEqual(["hardDrop", "lock", "gameOver"]);
  });
});

describe("finish", () => {
  it("finishes on the frame the target is reached", () => {
    const game = newGame({ targetLines: 2 });
    fillRows(game, [BOTTOM - 1, BOTTOM], [4, 5]);
    frames(game, 5);

    game.press("hardDrop");

    expect(game.finishFrame).toBe(5);
    expect(game.gameEvents).toEqual([
      "hardDrop",
      "lineClear",
      "finish",
      "garbage",
    ]);
  });

  it("stops after the clear plays out with no next piece", () => {
    const game = newGame({ targetLines: 2 });
    fillRows(game, [BOTTOM - 1, BOTTOM], [4, 5]);
    let calls = 0;
    game.subscribe(() => calls++);

    game.press("hardDrop");
    expect(game.finished).toBe(false);
    const n = framesUntil(game, () => game.finished);

    // Line clear animation and stack drop then ARE as before a spawn
    expect(n).toBe(6 * LINE_CLEAR_STEP_FRAMES + ARE[BOTTOM]);
    expect(game.ended).toBe(true);
    expect(game.livePiece).toBeNull();
    expect(game.getSnapshot()).toMatchObject({ finished: true, lines: 2 });
    expect(calls).toBe(2); // Line clear then finish
  });

  it("doesn't finish below the target", () => {
    const game = newGame({ targetLines: 3 });
    fillRows(game, [BOTTOM - 1, BOTTOM], [4, 5]);

    game.press("hardDrop");
    framesUntil(game, () => game.livePiece !== null);

    expect(game.finishFrame).toBeNull();
    expect(game.gameEvents).not.toContain("finish");
  });

  it("doesn't count cleared garbage rows", () => {
    const game = newGame({ targetLines: 2 });
    pushGarbageNow(game, [row(4, 5), row(4, 5)]);

    game.press("hardDrop");

    expect(game.finishFrame).toBeNull();
  });

  it("never finishes in 1P", () => {
    const game = newGame();
    game.lines = 98; // Skip ahead, internal field
    fillRows(game, [BOTTOM - 1, BOTTOM], [4, 5]);

    game.press("hardDrop");
    framesUntil(game, () => game.livePiece !== null);

    expect(game.getSnapshot().lines).toBe(100);
    expect(game.finishFrame).toBeNull();
  });
});

describe("frame count", () => {
  it("starts at 0 and counts every frame", () => {
    const game = newGame();
    expect(game.frameCount).toBe(0);

    frames(game, 100);
    expect(game.frameCount).toBe(100);
  });

  it("gives the frame game over happened on", () => {
    const game = newGame();
    fillRows(
      game,
      Array.from({ length: ROWS - 4 }, (_, i) => i + 4),
      [0],
    );

    game.press("hardDrop");
    const n = framesUntil(game, () => game.gameOver);

    expect(game.frameCount).toBe(n);
  });
});

describe("snapshot", () => {
  it("starts with the starting level", () => {
    expect(newGame({ level: 5 }).getSnapshot()).toEqual({
      score: 0,
      lines: 0,
      level: 5,
      gameOver: false,
      finished: false,
    });
  });

  it("notifies subscribers on line clear with a new snapshot", () => {
    const game = newGame({ level: 8 });
    fillRows(game, [BOTTOM - 1, BOTTOM], [4, 5]);
    const before = game.getSnapshot();
    let calls = 0;
    game.subscribe(() => calls++);

    game.press("hardDrop");

    expect(calls).toBe(1);
    expect(game.getSnapshot()).not.toBe(before);
    expect(game.getSnapshot()).toEqual({
      score: 900,
      lines: 2,
      level: 8,
      gameOver: false,
      finished: false,
    });
  });

  // useSyncExternalStore re-renders forever if the snapshot changes on every call
  it("keeps the same object while nothing changes", () => {
    const game = newGame();
    const snapshot = game.getSnapshot();
    let calls = 0;
    game.subscribe(() => calls++);

    game.press("moveLeft");
    game.press("hardDrop"); // Lock without line clear
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
    game.press("hardDrop");

    expect(calls).toBe(0);
    expect(game.getSnapshot().lines).toBe(1);
  });

  it("reports game over", () => {
    const game = newGame();
    fillRows(
      game,
      Array.from({ length: ROWS - 4 }, (_, i) => i + 4),
      [0],
    );
    let calls = 0;
    game.subscribe(() => calls++);

    game.press("hardDrop");
    framesUntil(game, () => game.getSnapshot().gameOver);

    expect(calls).toBe(1);
    expect(game.getSnapshot().gameOver).toBe(true);
  });
});

import { COLUMNS, PLAYFIELD_ROWS } from "./constants";

// 2P: what the other player's card shows of our game
// The visible board with the live piece in it, one digit per cell
// 0 is empty, otherwise the piece id (garbage rows keep their pieces' ids)
// Or JAMMED for the piece that topped out, gray as on the main board
// Rows top to bottom, PLAYFIELD_ROWS * COLUMNS digits
// The whole board each time, so there are no changes to keep in step
export const JAMMED = 8;

export function boardCells(game) {
  // The hidden spawn rows are the first 2 * COLUMNS cells
  const cells = Array.from(game.board.subarray(2 * COLUMNS));

  // At game over the live piece is the one that couldn't spawn
  const piece = game.livePiece;
  if (piece) {
    const id = game.gameOver ? JAMMED : piece.id;
    for (const [x, y] of piece.positions) {
      // Blocks still in the spawn rows don't show
      const row = piece.row + y - 2;
      if (row >= 0) cells[row * COLUMNS + piece.column + x] = id;
    }
  }

  return cells.join("");
}

const CELLS = new RegExp(`^[0-${JAMMED}]{${PLAYFIELD_ROWS * COLUMNS}}$`);

// Checks a state message from the other player before it's drawn
export function isBoardState({ cells, lines, level }) {
  return (
    typeof cells === "string" &&
    CELLS.test(cells) &&
    Number.isInteger(lines) &&
    lines >= 0 &&
    Number.isInteger(level) &&
    level >= 0
  );
}

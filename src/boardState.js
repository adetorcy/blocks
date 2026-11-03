import { COLUMNS, PLAYFIELD_ROWS } from "./constants";

// 2P: what the other player's card shows of our game
// The visible board with the live piece in it, one digit per cell
// 0 is empty, otherwise the piece id (garbage rows keep their pieces' ids)
// Rows top to bottom, PLAYFIELD_ROWS * COLUMNS digits
// The whole board each time, so there are no changes to keep in step
export function boardCells(game) {
  // The hidden spawn rows are the first 2 * COLUMNS cells
  const cells = Array.from(game.board.subarray(2 * COLUMNS));

  const piece = game.livePiece;
  if (piece) {
    for (const [x, y] of piece.positions) {
      // Blocks still in the spawn rows don't show
      const row = piece.row + y - 2;
      if (row >= 0) cells[row * COLUMNS + piece.column + x] = piece.id;
    }
  }

  return cells.join("");
}

const CELLS = new RegExp(`^[0-7]{${PLAYFIELD_ROWS * COLUMNS}}$`);

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

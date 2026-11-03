import { COLUMNS, GARBAGE_ROWS } from "./constants";

// 4 with a tetris
const MAX_ROWS = Math.max(...GARBAGE_ROWS);

// Checks garbage rows from the other player before they reach our game
// 1 to 4 rows of piece ids, each with a hole (a full row would never clear)
export function isGarbage(rows) {
  return (
    Array.isArray(rows) &&
    rows.length > 0 &&
    rows.length <= MAX_ROWS &&
    rows.every(
      (row) =>
        Array.isArray(row) &&
        row.length === COLUMNS &&
        row.every((id) => Number.isInteger(id) && id >= 0 && id <= 7) &&
        row.includes(0),
    )
  );
}

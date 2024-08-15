import { ROWS, COLUMNS, BOARD_SIZE } from "./constants";

// Cannot rely on autoFocus JSX param (?)
// We make our own using a ref callback
// https://react.dev/reference/react-dom/components/common#ref-callback
export const autoFocusRef = (node) => node?.focus();

export function padScore(score) {
  return score.toString().padStart(3, "0");
}

export function logBoard(board) {
  const strings = [];

  for (let i = 0; i < BOARD_SIZE; i += COLUMNS) {
    strings.push(board.slice(i, i + COLUMNS).join("\t"));
  }

  console.log(strings.join("\n").replaceAll("0", "."));
}

export function broadcast(event, value) {
  window.dispatchEvent(
    new CustomEvent(event, {
      detail: value,
    })
  );
}

// Check if a board position is occupied or out of bounds
export function badBlock(board, column, row) {
  return (
    board[row * COLUMNS + column] !== 0 ||
    column < 0 ||
    column >= COLUMNS ||
    row >= ROWS
  );
}

// Rough simulation of the piece selection algorithm
// https://tetrissuomi.wordpress.com/wp-content/uploads/2020/04/nes_tetris_rng.pdf
export function* sequence() {
  let roll = Math.trunc(Math.random() * 7);

  yield roll;

  while (true) {
    let previous = roll;

    roll = Math.trunc(Math.random() * 8);
    if (roll === 7 || roll === previous) {
      roll = Math.trunc(Math.random() * 7);
    }

    yield roll;
  }
}

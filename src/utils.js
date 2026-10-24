import { COLUMNS } from "./constants";

function blockFits(board, column, row) {
  return board[row * COLUMNS + column] === 0 && column >= 0 && column < COLUMNS;
}

export function pieceFits(board, piece) {
  return piece.positions.every(([x, y]) =>
    blockFits(board, piece.column + x, piece.row + y),
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

import { COLUMNS } from "./constants";

function blockFits(board, column, row) {
  return board[row * COLUMNS + column] === 0 && column >= 0 && column < COLUMNS;
}

export function pieceFits(board, piece) {
  return piece.positions.every(([x, y]) =>
    blockFits(board, piece.column + x, piece.row + y),
  );
}

// Random numbers in [0, 1) from a seed, the same seed gives the same numbers
// Mulberry32: 32-bit integer math only, so every browser gets the same pieces
// https://github.com/bryc/code/blob/master/jshash/PRNGs.md#mulberry32
export function seededRandom(seed) {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), state | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A seed for seededRandom, any 32-bit integer
// The 2P creator picks it and sends it to the joiner
export function randomSeed() {
  return Math.floor(Math.random() * 2 ** 32);
}

// Rough simulation of the piece selection algorithm
// https://tetrissuomi.wordpress.com/wp-content/uploads/2020/04/nes_tetris_rng.pdf
// Math.random in 1P, seededRandom in 2P so both players get the same pieces
export function* sequence(random = Math.random) {
  let roll = Math.trunc(random() * 7);

  yield roll;

  while (true) {
    let previous = roll;

    roll = Math.trunc(random() * 8);
    if (roll === 7 || roll === previous) {
      roll = Math.trunc(random() * 7);
    }

    yield roll;
  }
}

import { COLUMNS, BOARD_SIZE } from "./constants";
import { ONSCREEN_KEYDOWN, ONSCREEN_KEYUP } from "./events";

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
  dispatchEvent(
    new CustomEvent(event, {
      detail: value,
    })
  );
}

function blockFits(board, column, row) {
  return board[row * COLUMNS + column] === 0 && column >= 0 && column < COLUMNS;
}

export function pieceFits(board, piece) {
  return piece.positions.every(([x, y]) =>
    blockFits(board, piece.column + x, piece.row + y)
  );
}

export function dispatchKeyDown(options) {
  dispatchEvent(new KeyboardEvent(ONSCREEN_KEYDOWN, options));
}

export function dispatchKeyUp(options) {
  dispatchEvent(new KeyboardEvent(ONSCREEN_KEYUP, options));
}

export function listenForKeydown(handleKeydown) {
  window.addEventListener("keydown", handleKeydown);
  window.addEventListener(ONSCREEN_KEYDOWN, handleKeydown);
}

export function cleanupForKeydown(handleKeydown) {
  window.removeEventListener("keydown", handleKeydown);
  window.removeEventListener(ONSCREEN_KEYDOWN, handleKeydown);
}

export function listenForKeyup(handleKeyup) {
  window.addEventListener("keyup", handleKeyup);
  window.addEventListener(ONSCREEN_KEYUP, handleKeyup);
}

export function cleanupForKeyup(handleKeyup) {
  window.removeEventListener("keyup", handleKeyup);
  window.removeEventListener(ONSCREEN_KEYUP, handleKeyup);
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

export function play(media) {
  media.currentTime = 0;
  media.play();
}

export function about() {
  const style = (color) =>
    `color: ${color}; font-weight: 900; font-size: 48px; text-shadow: 1px 1px 0 black;`;

  const styles = [
    style("cyan"),
    style("orange"),
    style("lime"),
    style("magenta"),
    style("yellow"),
    style("red"),
  ];

  console.log(
    "%cB%cL%cO%cC%cK%cS",
    ...styles,
    `\n\nversion ${import.meta.env.VITE_APP_VERSION}\n\nadt 2024`
  );
}

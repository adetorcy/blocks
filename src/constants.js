// Playfield
export const BOARD_COLS = 10;
export const BOARD_ROWS = 22;
export const BOARD_SIZE = BOARD_COLS * BOARD_ROWS;

// Block size in pixels
export const BLOCK_SIZE = 40;

// Game events
export const SCORE_UPDATE_EVENT = "blocks:score-update";
export const LEVEL_UPDATE_EVENT = "blocks:level-update";
export const LINES_UPDATE_EVENT = "blocks:lines-update";

// Valid key presses
export const MOVE_KEY_CODES = new Set([
  "KeyZ",
  "KeyX",
  "Space",
  "ArrowUp",
  "ArrowLeft",
  "ArrowDown",
  "ArrowRight",
]);

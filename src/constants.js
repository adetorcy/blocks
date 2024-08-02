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
export const GAME_OVER_EVENT = "blocks:game-over";

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

// Frames per drop by level
export const GRAVITY_TABLE = [
  48, 43, 38, 33, 28, 23, 18, 13, 8, 6, 5, 5, 5, 4, 4, 4, 3, 3, 3, 2, 2, 2, 2,
  2, 2, 2, 2, 2, 2, 1,
];

// https://tetris.wiki/ARE
export const ARE = [
  18, 18, 18, 18, 18, 18, 18, 18, 16, 16, 16, 16, 14, 14, 14, 14, 12, 12, 12,
  12, 10, 10,
];

// Game
export const ROWS = 22;
export const COLUMNS = 10;
export const BOARD_SIZE = ROWS * COLUMNS;

// Block size in pixels
export const BLOCK_SIZE = 40;

// Playfield
export const PLAYFIELD_ROWS = 20;
export const PLAYFIELD_HEIGHT = PLAYFIELD_ROWS * BLOCK_SIZE;
export const PLAYFIELD_WIDTH = COLUMNS * BLOCK_SIZE;

// Preview box
export const PREVIEW_BOX_SIZE = 4 * BLOCK_SIZE;

// Line clear animation
export const LINE_CLEAR_STEP_FRAMES = 4;

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

// Simplified DAS: 10 frame initial delay, then 1 frame per shift
export const DAS_FRAMES = 10;

// Soft drop is 1/2 G
export const SOFT_DROP_FRAMES = 2;

// Game
export const ROWS = 22;
export const COLUMNS = 10;
export const BOARD_SIZE = ROWS * COLUMNS;

// Block size in pixels
export const BLOCK_SIZE = 40;

// Gap between blocks in pixels (one virtual pixel)
// Blocks are drawn this far into their cell, the gap on their left and top
// Canvases get this much extra for the gap after the last block
// So the board and preview canvases fill their cards on the 4px grid
export const BLOCK_GAP = 4;

// Playfield
export const PLAYFIELD_ROWS = 20;
export const PLAYFIELD_HEIGHT = PLAYFIELD_ROWS * BLOCK_SIZE + BLOCK_GAP;
export const PLAYFIELD_WIDTH = COLUMNS * BLOCK_SIZE + BLOCK_GAP;

// Preview box
export const PREVIEW_BOX_SIZE = 4 * BLOCK_SIZE + BLOCK_GAP;

// Opponent's board in their card (2P), 2/5 scale
// As wide as the preview box, so the dashboard keeps its width
export const OPPONENT_BLOCK_SIZE = 16;
export const OPPONENT_WIDTH = COLUMNS * OPPONENT_BLOCK_SIZE + BLOCK_GAP;
export const OPPONENT_HEIGHT = PLAYFIELD_ROWS * OPPONENT_BLOCK_SIZE + BLOCK_GAP;

// Lines to win a 2P game
export const TARGET_LINES = 100;

// Line clear animation
export const LINE_CLEAR_STEP_FRAMES = 4;

// Lock effect (white flash), ~200ms
export const LOCK_FLASH_FRAMES = 12;

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

// Simplified DAS: Wait 15 frames, then 2 frames per shift
export const DAS_DELAY = 15;
export const DAS_FRAMES = 2;

// 2P garbage rows sent by lines cleared, Game Boy rules: a single sends none
// https://tetris.wiki/Tetris_(Game_Boy)
export const GARBAGE_ROWS = [0, 0, 1, 2, 4];

// Soft drop is 1/3 G
export const SOFT_DROP_FRAMES = 3;

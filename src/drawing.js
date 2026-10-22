import {
  COLUMNS,
  PLAYFIELD_ROWS,
  BLOCK_SIZE,
  BLOCK_GAP,
  PLAYFIELD_WIDTH,
  PLAYFIELD_HEIGHT,
  PREVIEW_BOX_SIZE,
} from "./constants";
import PIECES from "./pieces";
import { WHITE } from "./colors";

const colors = Object.fromEntries(
  PIECES.map((piece) => [piece.id, piece.color]),
);

// Draw a single block
function drawBlock(ctx, x, y) {
  // Gap on the left and top
  [x, y] = [x + BLOCK_GAP, y + BLOCK_GAP];

  // draw main square
  ctx.fillRect(x, y, 36, 36);

  // save color and switch to white
  const color = ctx.fillStyle;
  ctx.fillStyle = WHITE;

  // draw white square in corner
  ctx.fillRect(x, y, 8, 8);

  // switch back to original color
  ctx.fillStyle = color;

  // cut white square corner
  ctx.fillRect(x + 4, y + 4, 4, 4);
}

// Draw a single (ghost) block
function drawGhostBlock(ctx, x, y) {
  // The 4px line is centered on the rectangle's edge
  // So the outline covers the same 36px square as a block
  [x, y] = [x + BLOCK_GAP + 2, y + BLOCK_GAP + 2];

  // draw main square
  ctx.strokeRect(x, y, 32, 32);
}

// Live piece, or the jammed piece in gray at game over
// Blocks on the top 2 rows are clipped
export function drawPiece(ctx, piece, color = piece.color) {
  ctx.fillStyle = color;

  piece.positions.forEach(([x, y]) => {
    drawBlock(
      ctx,
      (piece.column + x) * BLOCK_SIZE,
      (piece.row + y - 2) * BLOCK_SIZE,
    );
  });
}

// Outline of the live piece where it would land
export function drawGhostPiece(ctx, piece, row) {
  piece.positions.forEach(([x, y]) => {
    drawGhostBlock(
      ctx,
      (piece.column + x) * BLOCK_SIZE,
      (row + y - 2) * BLOCK_SIZE,
    );
  });
}

export function drawWhiteBlocks(ctx, blocks) {
  ctx.fillStyle = WHITE;

  blocks.forEach(([x, y]) => {
    ctx.fillRect(
      x * BLOCK_SIZE + BLOCK_GAP,
      (y - 2) * BLOCK_SIZE + BLOCK_GAP,
      36,
      36,
    );
  });
}

export function drawPreview(ctx, piece) {
  ctx.fillStyle = piece.color;

  piece.rotation[0].forEach(([x, y]) => {
    drawBlock(
      ctx,
      (piece.offset[0] + x) * BLOCK_SIZE,
      (piece.offset[1] + y) * BLOCK_SIZE,
    );
  });
}

// Draw the board minus the top 2 rows
export function drawBoard(ctx, board) {
  // Iterate over playfield (row, column) positions rather than board indices
  for (let row = 0; row < PLAYFIELD_ROWS; row++) {
    for (let column = 0; column < COLUMNS; column++) {
      // Playfield row 0 is board row 2, below the hidden spawn rows
      const pieceId = board[(row + 2) * COLUMNS + column];

      // Skip empty blocks
      if (pieceId) {
        ctx.fillStyle = colors[pieceId];
        drawBlock(ctx, column * BLOCK_SIZE, row * BLOCK_SIZE);
      }
    }
  }
}

export function clearBoard(ctx) {
  ctx.clearRect(0, 0, PLAYFIELD_WIDTH, PLAYFIELD_HEIGHT);
}

export function clearPreview(ctx) {
  ctx.clearRect(0, 0, PREVIEW_BOX_SIZE, PREVIEW_BOX_SIZE);
}

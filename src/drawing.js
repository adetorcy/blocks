import {
  COLUMNS,
  PLAYFIELD_ROWS,
  BLOCK_SIZE,
  PLAYFIELD_WIDTH,
  PLAYFIELD_HEIGHT,
  PREVIEW_BOX_SIZE,
} from "./constants";
import PIECES from "./pieces";

const colors = Object.fromEntries(
  PIECES.map((piece) => [piece.id, piece.color])
);

// Draw a single block
export function drawBlock(ctx, x, y) {
  // offset for border effect
  [x, y] = [x + 2, y + 2];

  // draw main square
  ctx.fillRect(x, y, 36, 36);

  // save color and switch to white
  const color = ctx.fillStyle;
  ctx.fillStyle = "white";

  // draw white square in corner
  ctx.fillRect(x, y, 8, 8);

  // switch back to original color
  ctx.fillStyle = color;

  // cut white square corner
  ctx.fillRect(x + 4, y + 4, 4, 4);
}

// Draw a single (ghost) block
export function drawGhostBlock(ctx, x, y) {
  // offset for border effect
  [x, y] = [x + 4, y + 4];

  // draw main square
  ctx.strokeRect(x, y, 32, 32);
}

export function drawJammedPiece(ctx, piece) {
  ctx.fillStyle = "DarkGray";

  piece.rotation[0].forEach(([x, y]) => {
    drawBlock(
      ctx,
      (piece.column + x) * BLOCK_SIZE,
      (piece.row + y - 2) * BLOCK_SIZE
    );
  });
}

export function drawWhiteBlocks(ctx, blocks) {
  ctx.fillStyle = "white";

  blocks.forEach(([x, y]) => {
    ctx.fillRect(x * BLOCK_SIZE + 2, (y - 2) * BLOCK_SIZE + 2, 36, 36);
  });
}

export function drawPreview(ctx, piece) {
  ctx.fillStyle = piece.color;

  piece.rotation[0].forEach(([x, y]) => {
    drawBlock(
      ctx,
      (piece.offset[0] + x) * BLOCK_SIZE,
      (piece.offset[1] + y) * BLOCK_SIZE
    );
  });
}

// Draw the board minus the top 2 rows
export function drawBoard(ctx, board) {
  let pieceId;

  // Iterate over playfield (row, column) positions rather than board indices
  for (let row = 0; row < PLAYFIELD_ROWS; row++) {
    for (let column = 0; column < COLUMNS; column++) {
      pieceId = board[(row + 2) * COLUMNS + column];

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

export const clearPiece = clearBoard;

export function clearPreview(ctx) {
  ctx.clearRect(0, 0, PREVIEW_BOX_SIZE, PREVIEW_BOX_SIZE);
}

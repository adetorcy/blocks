import {
  COLUMNS,
  PLAYFIELD_ROWS,
  BLOCK_SIZE,
  PLAYFIELD_WIDTH,
  PLAYFIELD_HEIGHT,
  PREVIEW_BOX_SIZE,
} from "./constants";
import PIECES from "./pieces";

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

// Draw a piece at a given (column, row) position
export function drawPiece(ctx, piece, column, row, rotationIdx, color) {
  if (color) {
    ctx.fillStyle = color;
  } else {
    setColor(ctx, piece.key);
  }

  piece.rotation[rotationIdx].forEach(([x, y]) => {
    drawBlock(ctx, (column + x) * BLOCK_SIZE, (row + y) * BLOCK_SIZE);
  });
}

// Draw the board minus the top 2 rows
export function drawBoard(ctx, board) {
  let key;

  // Iterate over playfield (row, column) positions rather than board indices
  for (let row = 0; row < PLAYFIELD_ROWS; row++) {
    for (let column = 0; column < COLUMNS; column++) {
      key = board[(row + 2) * COLUMNS + column];

      // Skip empty blocks
      if (key) {
        setColor(ctx, key);
        drawBlock(ctx, column * BLOCK_SIZE, row * BLOCK_SIZE);
      }
    }
  }
}

// Set canvas context fillStyle to piece color
export function setColor(ctx, key) {
  ctx.fillStyle = PIECES[key].color;
}

export function clearPlayfield(ctx) {
  ctx.clearRect(0, 0, PLAYFIELD_WIDTH, PLAYFIELD_HEIGHT);
}

export function clearPreview(ctx) {
  ctx.clearRect(0, 0, PREVIEW_BOX_SIZE, PREVIEW_BOX_SIZE);
}

export function clearBlock(ctx, x, y) {
  ctx.clearRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
}

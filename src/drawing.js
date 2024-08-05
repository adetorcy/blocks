import { BOARD_COLS, BOARD_SIZE, BLOCK_SIZE } from "./constants";
import { PIECE_COLORS } from "./pieceTypes";

// Draw a single block
function drawBlock(ctx, x, y) {
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

// Draw live piece in main canvas
export function drawPiece(ctx, piece) {
  // Set color
  ctx.fillStyle = PIECE_COLORS[piece.key];

  // Draw piece (shifted two rows up)
  piece.state.forEach((i) => {
    const [column, row] = [
      (i + piece.position) % BOARD_COLS,
      Math.trunc((i + piece.position - 20) / BOARD_COLS),
    ];
    drawBlock(ctx, column * BLOCK_SIZE, row * BLOCK_SIZE);
  });
}

// Draw next piece in preview canvas
export function drawPreview(ctx, piece) {
  // Set color
  ctx.fillStyle = PIECE_COLORS[piece.key];

  // Center piece
  const [x, y] = piece.offset;

  // Draw piece
  piece.states[0].forEach((i) => {
    const [column, row] = [i % BOARD_COLS, Math.trunc(i / BOARD_COLS)];
    drawBlock(ctx, (column + x) * BLOCK_SIZE, (row + y) * BLOCK_SIZE);
  });
}

// Draw the entire board
export function drawBoard(ctx, board) {
  // Top 2 rows are hidden
  for (let i = 20; i < BOARD_SIZE; i++) {
    const key = board[i];

    // Skip empty blocks
    if (!key) {
      continue;
    }

    // Get playfield coordinates
    const [col, row] = [i % BOARD_COLS, Math.trunc((i - 20) / BOARD_COLS)];

    // Draw block
    ctx.fillStyle = PIECE_COLORS[key];
    drawBlock(ctx, col * BLOCK_SIZE, row * BLOCK_SIZE);
  }
}

// testing
export function randomFill(ctx) {
  console.log("Painting canvas");

  for (let i = 0; i < 200; i++) {
    // get random piece color
    ctx.fillStyle = Object.values(PIECE_COLORS)[Math.trunc(Math.random() * 7)];

    // draw block
    const [column, row] = [i % 10, Math.trunc(i / 10)];
    drawBlock(ctx, column * BLOCK_SIZE, row * BLOCK_SIZE);
  }
}

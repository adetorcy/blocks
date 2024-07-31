import { BOARD_COLS, BLOCK_SIZE } from "./constants";

// Piece colors
const COLORS = {
  i: "cyan",
  o: "yellow",
  j: "blue",
  l: "orange",
  s: "lime",
  t: "magenta",
  z: "red",
};

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

// Draw piece in next piece box
export function drawPieceInBox(ctx, piece) {
  // Set color
  ctx.fillStyle = COLORS[piece.name];

  // Center piece in box
  const [x, y] = piece.offset;

  // Draw piece
  piece.state.forEach((value) => {
    const [column, row] = [value % BOARD_COLS, Math.trunc(value / BOARD_COLS)];
    drawBlock(ctx, (column + x) * BLOCK_SIZE, (row + y) * BLOCK_SIZE);
  });
}

// Draw board matrix onto canvas
export function drawBoard(ctx, board) {
  // Top 2 rows are hidden
  for (let i = 20; i < board.length; i++) {
    const pieceName = board[i];

    // Skip empty blocks
    if (!pieceName) {
      continue;
    }

    // Get playfield coordinates
    const [col, row] = [i % BOARD_COLS, Math.trunc((i - 20) / BOARD_COLS)];

    // Draw block
    ctx.fillStyle = COLORS[pieceName];
    drawBlock(ctx, col * BLOCK_SIZE, row * BLOCK_SIZE);
  }
}

// testing
export function randomFill(ctx) {
  console.log("Painting canvas");

  for (let i = 0; i < 200; i++) {
    // get random piece color
    ctx.fillStyle = Object.values(COLORS)[Math.trunc(Math.random() * 7)];

    // draw block
    const [column, row] = [i % 10, Math.trunc(i / 10)];
    drawBlock(ctx, column * BLOCK_SIZE, row * BLOCK_SIZE);
  }
}

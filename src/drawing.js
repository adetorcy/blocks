export const BLOCK_SIZE = 40;

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
  piece.rotationState.forEach((value) => {
    const [column, row] = [value % 4, Math.trunc(value / 4)];
    drawBlock(ctx, (column + x) * BLOCK_SIZE, (row + y) * BLOCK_SIZE);
  });
}

function drawRowElement(ctx, value, columnIdx, y) {
  ctx.fillStyle = COLORS[value];
  drawBlock(ctx, columnIdx * BLOCK_SIZE, y);
}

function drawBoardRow(ctx, row, rowIdx) {
  // Canvas y value for that row
  const y = rowIdx * BLOCK_SIZE;

  // Skip falsy values
  row.forEach((value, i) => value && drawRowElement(ctx, value, i, y));
}

// Draw board matrix onto canvas
export function drawBoard(ctx, board) {
  // Top 2 rows are hidden
  for (let i = 2; i < board.length; i++) {
    drawBoardRow(ctx, board[i], i - 2);
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

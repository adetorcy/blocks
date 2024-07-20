export const BLOCK_SIZE = 40;

export function clearCanvas(canvas) {
  canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
}

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

// stub
export function drawPiece(piece, canvas) {
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = piece.color;

  piece.rotation[0].map((value) => {
    const [column, row] = [value % 4, Math.trunc(value / 4)];
    drawBlock(ctx, column * BLOCK_SIZE, row * BLOCK_SIZE);
  });
}

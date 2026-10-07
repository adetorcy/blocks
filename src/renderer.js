import {
  drawBoard,
  drawBlock,
  drawPreview,
  drawJammedPiece,
  clearBoard,
  clearPreview,
  drawGhostBlock,
  drawWhiteBlocks,
} from "./drawing";
import { COLUMNS, BLOCK_SIZE } from "./constants";

export default class Renderer {
  constructor(boardCanvas, previewCanvas, fpsElement) {
    // Referenced elements should be in the DOM by the time this is called
    this.boardCanvasCtx = boardCanvas.getContext("2d");
    this.previewCanvasCtx = previewCanvas.getContext("2d");
    this.fpsElement = fpsElement;

    // Stroke styling
    // Only used by ghost piece so can be set once here
    this.boardCanvasCtx.lineWidth = 4;
    this.boardCanvasCtx.strokeStyle = "rgb(64,64,64)";
  }

  // Redraw everything from game state
  render(game, now) {
    // Board, including line clear animation
    clearBoard(this.boardCanvasCtx);
    drawBoard(this.boardCanvasCtx, game.board);

    if (game.gameOver) {
      drawJammedPiece(this.boardCanvasCtx, game.livePiece);
    } else if (game.livePiece) {
      this.drawGhostPiece(game.livePiece, game.ghostPieceRow);
      this.drawLivePiece(game.livePiece);
    }

    // Lock effect, skipping blocks already removed by a line clear
    if (game.lockFlash) {
      drawWhiteBlocks(
        this.boardCanvasCtx,
        game.lockFlash.blocks.filter(([x, y]) => game.board[y * COLUMNS + x]),
      );
    }

    // Next piece
    clearPreview(this.previewCanvasCtx);
    drawPreview(this.previewCanvasCtx, game.nextPiece);

    this.fpsCounter(now);
  }

  clear() {
    clearBoard(this.boardCanvasCtx);
    clearPreview(this.previewCanvasCtx);
    this.fpsElement.textContent = 0;
  }

  drawLivePiece(piece) {
    // Blocks on top two rows will be clipped
    this.boardCanvasCtx.fillStyle = piece.color;
    piece.positions.forEach(([x, y]) => {
      drawBlock(
        this.boardCanvasCtx,
        (piece.column + x) * BLOCK_SIZE,
        (piece.row - 2 + y) * BLOCK_SIZE,
      );
    });
  }

  drawGhostPiece(piece, row) {
    piece.positions.forEach(([x, y]) => {
      drawGhostBlock(
        this.boardCanvasCtx,
        (piece.column + x) * BLOCK_SIZE,
        (row - 2 + y) * BLOCK_SIZE,
      );
    });
  }

  // Very rough FPS counter that only updates about once per second
  fpsCounter(now) {
    if (!this.fpsCounterStart) {
      this.fpsCounterStart = now;
      this.fpsCount = 0;
      return;
    }

    if (now - this.fpsCounterStart >= 1000) {
      this.fpsElement.textContent = this.fpsCount;
      this.fpsCount = 0;
      this.fpsCounterStart = now;
    } else {
      this.fpsCount++;
    }
  }
}

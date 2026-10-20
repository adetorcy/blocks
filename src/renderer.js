import {
  drawBoard,
  drawPiece,
  drawGhostPiece,
  drawPreview,
  clearBoard,
  clearPreview,
  drawWhiteBlocks,
} from "./drawing";
import { COLUMNS } from "./constants";

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
      drawPiece(this.boardCanvasCtx, game.livePiece, "DarkGray");
    } else if (game.livePiece) {
      drawGhostPiece(this.boardCanvasCtx, game.livePiece, game.ghostPieceRow);
      drawPiece(this.boardCanvasCtx, game.livePiece);
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

    // This will show screen frames, not game frames:
    // The loop renders once per requestAnimationFrame callback
    // Which means counter shows the display refresh rate (90 on a 90 Hz phone)
    // The game itself always runs 60 frames per second (see Loop)
    // Gravity, DAS, ARE, line clear effects, etc. are counted in game frames
    // So they run at the same real speed whatever the display does
    // At 90 Hz two renders out of three run a game frame
    // The third one just redraws the same state
    // Pieces only move a whole cell on game frames so the extra redraws don't show
    this.fpsCounter(now);
  }

  clear() {
    clearBoard(this.boardCanvasCtx);
    clearPreview(this.previewCanvasCtx);
    this.fpsElement.textContent = 0;
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

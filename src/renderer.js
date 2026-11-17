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
import { GRAY } from "./colors";

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
      drawPiece(this.boardCanvasCtx, game.livePiece, GRAY);
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

  // Rough FPS counter that only updates about once per second
  // The counter only checks the time on a frame, so its window ends a little past 1 s
  // It shows the frames in that window divided by its real length, rounded
  // 60 Hz then shows 60, whether the display runs a hair fast or slow
  fpsCounter(now) {
    if (!this.fpsCounterStart) {
      this.fpsCounterStart = now;
      this.fpsCount = 0;
      return;
    }

    this.fpsCount++;
    const elapsed = now - this.fpsCounterStart;
    if (elapsed >= 1000) {
      this.fpsElement.textContent = Math.round(
        (this.fpsCount * 1000) / elapsed,
      );
      this.fpsCount = 0;
      this.fpsCounterStart = now;
    }
  }
}

import { drawBoard, drawPiece, drawPreview } from "./drawing";
import Piece from "./piece";
import {
  BOARD_COLS,
  BOARD_SIZE,
  GRAVITY_TABLE,
  ARE,
  SCORE_UPDATE_EVENT,
  LEVEL_UPDATE_EVENT,
  LINES_UPDATE_EVENT,
  GAME_OVER_EVENT,
} from "./constants";
import { clearCanvas } from "./utils";

/**  Useful links
 *
 * https://harddrop.com/wiki/Tetris_(NES,_Nintendo)
 * https://harddrop.com/wiki/Tetris_(Game_Boy)
 * https://tetris.wiki/Tetris_(NES,_Nintendo)
 * https://tetris.wiki/Tetris_(Game_Boy)
 *
 **/

export default class Game {
  constructor() {
    this.board = new Array(BOARD_SIZE); // Uint8Array for multiplayer/webSocket?
  }

  start(gameCanvas, previewCanvas, fpsElement, level = 0) {
    // First game?
    if (!this.gameCanvas) {
      // Referenced elements should be in the DOM by the time this method is called
      this.gameCanvas = gameCanvas;
      this.gameCanvasCtx = gameCanvas.getContext("2d");
      this.previewCanvas = previewCanvas;
      this.previewCanvasCtx = previewCanvas.getContext("2d");
      this.fpsElement = fpsElement;
    }

    // Zero out board
    this.board.fill(0);

    // Set up level and speed
    this.score = 0;
    this.lines = 0;
    this.level = level;
    this.delay = GRAVITY_TABLE[level] || 1; // Frames between drops
    this.framesRemaining = this.delay;

    // Get first 2 pieces
    this.getPiece();

    // Start game loop
    this.run();
  }

  run() {
    // Both NES and GameBoy run at 60 frames per second (very close)
    // This will likely be off by a few frames (https://stackoverflow.com/a/15216501)
    this.intervalID = setInterval(() => this.frame(), 1000 / 60);
  }

  stop() {
    clearInterval(this.intervalID);
  }

  reset() {
    // Clear canvas for start menu
    clearCanvas(this.gameCanvas);
    clearCanvas(this.previewCanvas);

    // Reset scores
    this.score = 0;
    this.level = 0;
    this.lines = 0;

    this.broadcastAll();
  }

  frame() {
    this.refresh();

    // Nothing to do while we have frames to burn
    if (this.framesRemaining--) return;

    /** No more frames. One of the following happens:
     * Live piece falls down one row
     * Live piece locks
     * A new piece spawns
     * The game ends
     **/

    // No live piece
    if (!this.livePiece) {
      this.getPiece();

      // New piece spawns
      if (this.hasRoom(this.livePiece.state, this.livePiece.position)) {
        this.framesRemaining = this.delay;
      } else {
        // GAME OVER
        this.livePiece = null;
        this.stop();

        // Notify UI
        window.dispatchEvent(new CustomEvent(GAME_OVER_EVENT));
      }
      return;
    }

    // Live piece tries to move down
    this.moveDown();

    // Reset cycle
    this.framesRemaining = this.delay;
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

  refresh() {
    requestAnimationFrame((now) => {
      clearCanvas(this.gameCanvas);
      drawBoard(this.gameCanvasCtx, this.board);
      if (this.livePiece) drawPiece(this.gameCanvasCtx, this.livePiece);
      this.fpsCounter(now);
    });
  }

  lock(row) {
    // Add live piece to board
    this.livePiece.state.forEach((i) => {
      this.board[this.livePiece.position + i] = this.livePiece.key;
    });

    this.livePiece = null;
    this.framesRemaining = ARE[row];
  }

  preview() {
    requestAnimationFrame(() => {
      clearCanvas(this.previewCanvas);
      drawPreview(this.previewCanvasCtx, this.nextPiece);
    });
  }

  getPiece() {
    this.livePiece = this.nextPiece || Piece.random();
    this.nextPiece = Piece.random();
    this.preview();
  }

  hasRoom(state, position) {
    // Check state and position for collision with existing blocks
    return state.every((i) => this.board[i + position] === 0);
  }

  isComplete(rowIdx) {
    // Line clear check
    const start = rowIdx * BOARD_COLS;
    for (let i = start; i < start + BOARD_COLS; i++) {
      if (this.board[i] === 0) return false;
    }
    return true;
  }

  rotateCW() {
    if (this.livePiece.cannotSpin()) return;

    const i = (this.livePiece.stateIdx + 1) % 4;
    if (this.hasRoom(this.livePiece.states[i], this.livePiece.position))
      this.livePiece.stateIdx = i;
  }

  rotateCCW() {
    if (this.livePiece.cannotSpin()) return;

    const i = (this.livePiece.stateIdx + 3) % 4;
    if (this.hasRoom(this.livePiece.states[i], this.livePiece.position))
      this.livePiece.stateIdx = i;
  }

  moveLeft() {
    if (this.livePiece.touchesLeftWall()) return;

    const p = this.livePiece.position - 1;
    if (this.hasRoom(this.livePiece.state, p)) this.livePiece.position = p;
  }

  moveRight() {
    if (this.livePiece.touchesRightWall()) return;

    const p = this.livePiece.position + 1;
    if (this.hasRoom(this.livePiece.state, p)) this.livePiece.position = p;
  }

  moveDown() {
    // Index of piece's "base" row
    const row = this.livePiece.baseRow;

    // If live piece is not at the bottom, try to move it down
    if (row !== 21) {
      const p = this.livePiece.position + BOARD_COLS;

      if (this.hasRoom(this.livePiece.state, p)) {
        this.livePiece.position = p;
        return;
      }
    }

    // Lock piece and check for cleared lines
    this.lock(row);
    const cleared = [];

    // Check line indices top to row (including)
    const top = Math.max(0, row - 3);

    for (let rowIdx = top; rowIdx <= row; rowIdx++) {
      if (this.isComplete(rowIdx)) {
        cleared.push(rowIdx);
      }
    }

    if (cleared.length) {
      // Line clearing animation
    }
  }

  // Handle key events
  move(keyCode) {
    // ARE
    if (!this.livePiece) return;

    switch (keyCode) {
      case "KeyZ":
        this.rotateCCW();
        break;
      case "KeyX":
      case "ArrowUp":
        this.rotateCW();
        break;
      case "ArrowLeft":
        this.moveLeft();
        break;
      case "ArrowDown":
        this.moveDown();
        break;
      case "ArrowRight":
        this.moveRight();
        break;
      default:
        // Do nothing
        console.log(`${keyCode} key not supported`);
        return;
    }
  }

  broadcastScore() {
    window.dispatchEvent(
      new CustomEvent(SCORE_UPDATE_EVENT, {
        detail: this.score,
      })
    );
  }

  broadcastLevel() {
    window.dispatchEvent(
      new CustomEvent(LEVEL_UPDATE_EVENT, {
        detail: this.level,
      })
    );
  }

  broadcastLines() {
    window.dispatchEvent(
      new CustomEvent(LINES_UPDATE_EVENT, {
        detail: this.lines,
      })
    );
  }

  broadcastAll() {
    this.broadcastScore();
    this.broadcastLevel();
    this.broadcastLines();
  }
}

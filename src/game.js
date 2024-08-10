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
import { sequence, levelUpThresholds, broadcast, clearCanvas } from "./utils";

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
    this.sequence = sequence(); // Pseudo random integers between 0 and 6
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
    this.levelUpThresholds = levelUpThresholds(level);
    this.nextLevelUp = this.levelUpThresholds.next().value;
    this.delay = GRAVITY_TABLE[level] || 1; // Frames between drops
    this.framesRemaining = this.delay;

    // Line clearing
    this.cleared = []; // Indices of cleared lines
    this.lineClearAnimationStep = 0;

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

    broadcast(SCORE_UPDATE_EVENT, 0);
    broadcast(LEVEL_UPDATE_EVENT, 0);
    broadcast(LINES_UPDATE_EVENT, 0);
  }

  frame() {
    this.refresh();

    // Nothing to do while we have frames to burn
    if (this.framesRemaining--) return;

    /** No more frames. One of the following happens:
     * Live piece falls down one row
     * Live piece locks
     * Line clear animation moves one step
     * A new piece spawns
     * The game ends
     **/

    // No live piece
    if (!this.livePiece) {
      if (this.lineClearAnimationStep) {
        this.lineClearAnimation();
        return;
      }

      // Remove any cleared lines from the board
      while (this.cleared.length) this.clearLine(this.cleared.pop());

      // Update current and next piece
      this.getPiece();
      if (this.hasRoom(this.livePiece.state, this.livePiece.position)) {
        // New piece spawns
        this.framesRemaining = this.delay;
      } else {
        // GAME OVER
        this.livePiece = null;
        this.stop();

        // Notify UI
        broadcast(GAME_OVER_EVENT);
      }
      return;
    }

    // Live piece tries to move down
    if (this.moveDown()) this.resetCycle();
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

  resetCycle() {
    this.framesRemaining = this.delay;
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
    // Add live piece to the board
    this.livePiece.state.forEach((i) => {
      this.board[this.livePiece.position + i] = this.livePiece.key;
    });

    // Kill live piece
    this.livePiece = null;

    // See if we cleared any lines
    const top = Math.max(0, row - 3);
    for (let rowIdx = row; rowIdx >= top; rowIdx--) {
      if (this.isComplete(rowIdx)) {
        // Store line indices bottom up
        this.cleared.push(rowIdx);
      }
    }

    // If no lines were cleared just set spawn delay
    if (!this.cleared.length) {
      this.framesRemaining = ARE[row];
      return;
    }

    // Update player progress
    this.reward(this.cleared.length);

    // Start line clear animation immediately
    this.framesRemaining = 0;
    this.lineClearAnimationStep = 5;
  }

  reward(lines) {
    // Score
    // https://tetris.wiki/Scoring
    broadcast(
      SCORE_UPDATE_EVENT,
      (this.score += (this.level + 1) * [40, 100, 300, 1200][lines - 1])
    );

    // Lines
    broadcast(LINES_UPDATE_EVENT, (this.lines += lines));

    // Level
    if (this.lines >= this.nextLevelUp) {
      broadcast(LEVEL_UPDATE_EVENT, ++this.level);
      this.nextLevelUp = this.levelUpThresholds.next().value;
    }
  }

  lineClearAnimation() {
    // Middle out block clear, for each row
    // Step goes from 5 through 1
    this.cleared.forEach((row) => {
      const [left, right] = [
        row * BOARD_COLS + this.lineClearAnimationStep - 1,
        (row + 1) * BOARD_COLS - this.lineClearAnimationStep,
      ];
      this.board[left] = 0;
      this.board[right] = 0;
    });

    this.framesRemaining = 5;
    this.lineClearAnimationStep--;
  }

  preview() {
    requestAnimationFrame(() => {
      clearCanvas(this.previewCanvas);
      drawPreview(this.previewCanvasCtx, this.nextPiece);
    });
  }

  getPiece() {
    this.livePiece =
      this.nextPiece || Piece.fromInt(this.sequence.next().value);
    this.nextPiece = Piece.fromInt(this.sequence.next().value);
    this.preview();
  }

  // Check state and position for collision with existing blocks
  hasRoom(state, position) {
    return state.every((i) => this.board[i + position] === 0);
  }

  // Line clear check
  isComplete(rowIdx) {
    const start = rowIdx * BOARD_COLS;
    for (let i = start; i < start + BOARD_COLS; i++) {
      if (this.board[i] === 0) return false;
    }
    return true;
  }

  // Clear a completed line
  clearLine(rowIdx) {
    // Everything before the beginning of that line shifts by 1 row
    for (let i = rowIdx * BOARD_COLS - 1; i >= 0; i--) {
      this.board[i + BOARD_COLS] = this.board[i];
    }

    // Zero out 1st row
    for (let i = 0; i < BOARD_COLS; i++) {
      this.board[i] = 0;
    }
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

  // Move down or lock
  moveDown() {
    const row = this.livePiece.baseRow;

    // If live piece is not at the bottom, try to move it down
    if (row < 21) {
      const p = this.livePiece.position + BOARD_COLS;

      if (this.hasRoom(this.livePiece.state, p)) {
        this.livePiece.position = p;
        return true;
      }
    }

    this.lock(row);
    return false;
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
      case "Space":
        // Hard drop
        while (this.moveDown());
        break;
      default:
        // Do nothing
        console.log(`${keyCode} key not supported`);
        return;
    }
  }
}

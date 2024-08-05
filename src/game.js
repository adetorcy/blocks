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
import { clearCanvas, occupied, logBoard } from "./utils";

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
    // Both NES and GameBoy run at roughly 60 frames per second
    this.intervalID = setInterval(() => this.frame(), 1000 / 60);

    console.log("running");
  }

  stop() {
    clearInterval(this.intervalID);

    console.log("stopped");
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

    console.log("reset");
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

      // If piece can't spawn, game over
      if (occupied(this.board, this.livePiece.state, this.livePiece.position)) {
        this.livePiece = null;
        console.log("Game Over");
        this.stop();

        // Notify UI
        window.dispatchEvent(new CustomEvent(GAME_OVER_EVENT));

        return;
      }

      // Reset delay
      this.framesRemaining = this.delay;

      return;
    }

    // Live piece tries to fall down one level
    this.moveDown();

    // Reset delay
    this.framesRemaining = this.delay;
  }

  // Very rough FPS counter that only updates about once per second
  fpsCounter(now) {
    if (!this.timeStamp) {
      this.timeStamp = now;
      this.frameCount = 0;
      return;
    }

    if (now - this.timeStamp >= 1000) {
      this.fpsElement.textContent = this.frameCount;
      this.frameCount = 0;
      this.timeStamp = now;
    } else {
      this.frameCount++;
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

  rotateCW() {
    if (this.livePiece.cannotSpin()) return;

    // New rotation index
    const i = (this.livePiece.stateIdx + 1) % 4;

    // Rotate if we can
    occupied(this.board, this.livePiece.states[i], this.livePiece.position) ||
      (this.livePiece.stateIdx = i);
  }

  rotateCCW() {
    if (this.livePiece.cannotSpin()) return;

    // New rotation index
    const i = (this.livePiece.stateIdx + 3) % 4;

    // Rotate if we can
    occupied(this.board, this.livePiece.states[i], this.livePiece.position) ||
      (this.livePiece.stateIdx = i);
  }

  moveLeft() {
    if (this.livePiece.touchesLeftWall()) return;

    // Move, check, rollback
    if (occupied(this.board, this.livePiece.state, --this.livePiece.position)) {
      ++this.livePiece.position;
    }
  }

  moveRight() {
    if (this.livePiece.touchesRightWall()) return;

    // Move, check, rollback
    if (occupied(this.board, this.livePiece.state, ++this.livePiece.position)) {
      --this.livePiece.position;
    }
  }

  moveDown() {
    // More work to do in this method

    // Are we at the bottom?
    if (this.livePiece.touchesBottom()) {
      this.lock(21);

      // LINE CLEAR CHECK

      return;
    }

    // Try to move down on row

    if (
      !occupied(
        this.board,
        this.livePiece.state,
        (this.livePiece.position += BOARD_COLS)
      )
    ) {
      // Success, nothing else to do
      return;
    }

    // Rollback
    this.livePiece.position -= BOARD_COLS;

    // Add piece before locking it

    this.lock(this.livePiece.lowestRow);

    // LINE CLEAR CHECK
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

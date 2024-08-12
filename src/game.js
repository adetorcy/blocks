import {
  drawBoard,
  drawBlock,
  drawPiece,
  clearPlayfield,
  clearPreview,
  clearBlock,
  setColor,
} from "./drawing";
import PIECES from "./pieces";
import {
  COLUMNS,
  BOARD_SIZE,
  BLOCK_SIZE,
  GRAVITY_TABLE,
  ARE,
  LINE_CLEAR_STEP_FRAMES,
  SCORE_UPDATE_EVENT,
  LEVEL_UPDATE_EVENT,
  LINES_UPDATE_EVENT,
  GAME_OVER_EVENT,
} from "./constants";
import { sequence, broadcast, validate } from "./utils";

/**  Useful links
 *
 * https://tetris.fandom.com/wiki/Tetris_Wiki
 * https://harddrop.com/wiki/Tetris_Wiki
 * https://tetris.wiki/Tetris.wiki
 *
 **/

export default class Game {
  constructor() {
    this.board = new Array(BOARD_SIZE); // Use one flat array (TypedArray for multiplayer?)
    this.sequence = sequence(); // Pseudo random integers between 0 and 6
  }

  init(gameCanvas, previewCanvas, fpsElement, level = 0) {
    // Referenced elements should be in the DOM by the time this method is called
    this.gameCanvasCtx = gameCanvas.getContext("2d");
    this.previewCanvasCtx = previewCanvas.getContext("2d");
    this.fpsElement = fpsElement;

    // Zero out board
    this.board.fill(0);

    // Initial values
    this.score = 0;
    this.lines = 0;
    this.level = level;

    // Show starting level if not 0
    if (level) broadcast(LEVEL_UPDATE_EVENT, level);

    // Initial speed
    this.delay = GRAVITY_TABLE[level] || 1; // Frames between drops
    this.framesRemaining = this.delay;

    // 1st level up, after that every 10 lines
    // https://tetris.wiki/Tetris_(NES,_Nintendo)
    this.nextLevelUp = Math.min(
      level * 10 + 10,
      Math.max(100, level * 10 - 50)
    );

    // Line clearing
    this.cleared = []; // Indices of cleared lines
    this.lineClearAnimationStep = 0;

    // Get first 2 pieces
    this.livePiece = this.getNextPiece();
    this.nextPiece = this.getNextPiece();

    // Show next piece
    this.preview();

    // Live piece state
    [this.column, this.row] = this.livePiece.spawn;
    this.rotationIdx = 0;

    // Save live block positions for drawing/clearing
    this.blocks = [];
  }

  run() {
    // Both NES and GameBoy run at 60 frames per second (very close)
    // This will likely be off by a few frames (https://stackoverflow.com/a/15216501)
    this.intervalID = setInterval(() => this.frame(), 1000 / 60);
  }

  stop() {
    clearInterval(this.intervalID);
  }

  quit() {
    // Clear UI
    clearPlayfield(this.gameCanvasCtx);
    clearPreview(this.previewCanvasCtx);

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

      // Step through piece sequence
      this.livePiece = this.nextPiece;
      this.nextPiece = this.getNextPiece();

      // Reset live piece state
      [this.column, this.row] = this.livePiece.spawn;
      this.rotationIdx = 0;

      if (validate(this.board, this.column, this.row, this.rotationState)) {
        // Reset cycle
        this.framesRemaining = this.delay;
      } else {
        /**
         * GAME OVER!!
         **/

        // Show jammed piece
        requestAnimationFrame(() => {
          drawPiece(
            this.gameCanvasCtx,
            this.livePiece,
            this.column,
            this.row - 2,
            0
          );
        });

        // And we're done
        this.stop();

        // Notify UI
        broadcast(GAME_OVER_EVENT);
      }

      // Show next piece
      this.preview();

      return;
    }

    // Live piece tries to move down
    this.moveDown() && (this.framesRemaining = this.delay);
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
      if (this.dirty) {
        clearPlayfield(this.gameCanvasCtx);
        drawBoard(this.gameCanvasCtx, this.board);
        this.dirty = false;
      }
      if (this.livePiece) this.drawLivePiece();
      this.fpsCounter(now);
    });
  }

  lock() {
    // Live piece's lowest row
    const row = this.row + this.rotationState[3][1];

    // Add live piece to the board
    this.rotationState.forEach(([x, y]) => {
      this.board[(this.row + y) * COLUMNS + this.column + x] =
        this.livePiece.key;
    });

    // Board will need redrawing
    this.dirty = true;

    // Kill live piece
    this.livePiece = null;

    // Reset live block positions (so they don't get cleared by the next piece)
    this.blocks = [];

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

    // Start line clear animation
    this.framesRemaining = LINE_CLEAR_STEP_FRAMES;
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
      this.delay = GRAVITY_TABLE[this.level] || 1;
      this.nextLevelUp += 10;
    }
  }

  lineClearAnimation() {
    // Middle out block clear, for each row
    // Step goes from 5 through 1
    this.cleared.forEach((row) => {
      const [left, right] = [
        row * COLUMNS + this.lineClearAnimationStep - 1,
        (row + 1) * COLUMNS - this.lineClearAnimationStep,
      ];
      this.board[left] = 0;
      this.board[right] = 0;
    });

    this.framesRemaining = LINE_CLEAR_STEP_FRAMES;
    this.lineClearAnimationStep--;

    // Redraw board
    this.dirty = true;
  }

  preview() {
    requestAnimationFrame(() => {
      clearPreview(this.previewCanvasCtx);
      drawPiece(
        this.previewCanvasCtx,
        this.nextPiece,
        ...this.nextPiece.offset,
        0
      );
    });
  }

  getNextPiece() {
    return Object.values(PIECES)[this.sequence.next().value];
  }

  // Line clear check
  isComplete(rowIdx) {
    const start = rowIdx * COLUMNS;
    for (let i = start; i < start + COLUMNS; i++) {
      if (this.board[i] === 0) return false;
    }
    return true;
  }

  // Clear a completed line
  clearLine(rowIdx) {
    // Everything before the beginning of that line shifts by 1 row
    for (let i = rowIdx * COLUMNS - 1; i >= 0; i--) {
      this.board[i + COLUMNS] = this.board[i];
    }

    // Zero out 1st row
    for (let i = 0; i < COLUMNS; i++) {
      this.board[i] = 0;
    }

    // Redraw board
    this.dirty = true;
  }

  // Clockwise
  rotateRight() {
    const i = this.rotationIdx;
    this.rotationIdx = (this.rotationIdx + 1) % 4;

    validate(this.board, this.column, this.row, this.rotationState) ||
      (this.rotationIdx = i);
  }

  // Counterclockwise
  rotateLeft() {
    const i = this.rotationIdx;
    this.rotationIdx = (this.rotationIdx + 3) % 4;

    validate(this.board, this.column, this.row, this.rotationState) ||
      (this.rotationIdx = i);
  }

  moveLeft() {
    validate(this.board, --this.column, this.row, this.rotationState) ||
      this.column++;
  }

  moveRight() {
    validate(this.board, ++this.column, this.row, this.rotationState) ||
      this.column--;
  }

  // Move down or lock
  moveDown() {
    if (validate(this.board, this.column, this.row + 1, this.rotationState)) {
      this.row++;
      return true;
    }

    this.lock();
    return false;
  }

  // Handle keyboard events
  keydown(keyCode) {
    if (!this.livePiece) return;

    switch (keyCode) {
      case "KeyZ":
        this.rotateLeft();
        break;
      case "KeyX":
      case "ArrowUp":
        this.rotateRight();
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
      case "Escape":
        // Pause
        this.stop();
        break;
      default:
        // Do nothing
        console.log(`${keyCode} key not supported`);
        return;
    }
  }

  // stub
  keyup(keyCode) {
    console.log("Keyup: %s", keyCode);
  }

  // Class utilities
  get rotationState() {
    return this.livePiece.rotation[this.rotationIdx];
  }

  drawLivePiece() {
    // Clear existing blocks
    this.blocks.forEach(([x, y]) => clearBlock(this.gameCanvasCtx, x, y));

    // Get new block positions
    this.blocks = this.rotationState.map(([x, y]) => [
      (this.column + x) * BLOCK_SIZE,
      (this.row - 2 + y) * BLOCK_SIZE,
    ]);

    // Draw new blocks. Blocks on top two rows will be clipped
    setColor(this.gameCanvasCtx, this.livePiece.key);
    this.blocks.forEach(([x, y]) => {
      drawBlock(this.gameCanvasCtx, x, y);
    });
  }
}

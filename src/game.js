import PIECES from "./pieces";
import {
  COLUMNS,
  BOARD_SIZE,
  GRAVITY_TABLE,
  ARE,
  LINE_CLEAR_STEP_FRAMES,
  LOCK_FLASH_FRAMES,
  SOFT_DROP_FRAMES,
  DAS_DELAY,
  DAS_FRAMES,
} from "./constants";
import { SCORE_UPDATE, LEVEL_UPDATE, LINES_UPDATE, GAME_OVER } from "./events";
import { sequence, broadcast, pieceFits } from "./utils";

/**  Useful links
 *
 * https://tetris.fandom.com/wiki/Tetris_Wiki
 * https://harddrop.com/wiki/Tetris_Wiki
 * https://tetris.wiki/Tetris.wiki
 *
 **/

export default class Game {
  constructor(sound, level = 0, pieceSequence = sequence()) {
    // Playfield
    this.board = new Uint8Array(BOARD_SIZE).fill(0);

    // Pseudo random integers between 0 and 6
    this.sequence = pieceSequence;

    // Plays a sound effect by name
    this.sound = sound;

    // Initial values
    this.score = 0;
    this.lines = 0;
    this.level = level;

    // Show starting level if not 0
    if (level) broadcast(LEVEL_UPDATE, level);

    // Initial speed
    this.delay = GRAVITY_TABLE[level] || 1; // Frames between drops
    this.framesRemaining = this.delay;

    // 1st level up, after that every 10 lines
    // https://tetris.wiki/Tetris_(NES,_Nintendo)
    this.nextLevelUp = Math.min(
      level * 10 + 10,
      Math.max(100, level * 10 - 50),
    );

    // Line clearing
    this.cleared = []; // Indices of cleared lines
    this.lineClearAnimationStep = 0;

    // Lock effect: { blocks, framesLeft } while active
    this.lockFlash = null;

    this.gameOver = false;

    // UI subscribers and initial snapshot
    this.listeners = new Set();
    this.notify();

    // Get first 2 pieces
    this.livePiece = this.getPiece();
    this.nextPiece = this.getPiece();

    // Ghost piece
    this.setGhostPiece();
  }

  /**
   * UI state for React (useSyncExternalStore)
   * Arrow functions because React calls them unbound
   **/

  subscribe = (callback) => {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  };

  // Same object until something changes
  // React compares snapshots by reference and re-renders when they differ
  getSnapshot = () => this.snapshot;

  // New snapshot then tell subscribers
  notify() {
    this.snapshot = {
      score: this.score,
      lines: this.lines,
      level: this.level,
      gameOver: this.gameOver,
    };
    this.listeners.forEach((callback) => callback());
  }

  // Advance the game by one frame (run 60 times per second by the loop)
  frame() {
    // Lock effect countdown
    if (this.lockFlash && --this.lockFlash.framesLeft === 0) {
      this.lockFlash = null;
    }

    /**
     * Check for DAS and soft drop
     **/

    if (this.leftDasOn) {
      if (--this.leftDasFramesLeft === 0) {
        this.moveLeft();
        this.leftDasFramesLeft = DAS_FRAMES;
      }
    }

    if (this.rightDasOn) {
      if (--this.rightDasFramesLeft === 0) {
        this.moveRight();
        this.rightDasFramesLeft = DAS_FRAMES;
      }
    }

    if (this.softDropOn) {
      if (--this.softDropFramesLeft === 0) {
        this.moveDown();
        this.softDropFramesLeft = SOFT_DROP_FRAMES;
      }
    }

    /**
     * Nothing else to do while we have frames to burn
     **/
    if (--this.framesRemaining > 0) return;

    /**
     * No more frames. One of the following happens:
     * Live piece falls down one row
     * Live piece locks
     * Line clear animation moves one step
     * A new piece spawns
     * The game ends
     **/

    if (this.livePiece) {
      // Live piece moves down or locks
      this.moveDown();
      return;
    }

    /**
     * No live piece
     **/

    if (this.lineClearAnimationStep) {
      this.lineClearAnimation();
      return;
    }

    // Remove any cleared lines from the board
    while (this.cleared.length) this.deleteLine(this.cleared.pop());

    // Step through piece sequence
    this.livePiece = this.nextPiece;
    this.nextPiece = this.getPiece();

    // Update ghost piece
    this.setGhostPiece();

    if (pieceFits(this.board, this.livePiece)) {
      /**
       * New piece spawns successfully
       **/

      // Reset cycle
      this.framesRemaining = this.delay;
    } else {
      /**
       * GAME OVER!!
       **/

      // Jammed piece is drawn by renderer, loop stops
      this.gameOver = true;

      // Notify UI
      this.notify();
      broadcast(GAME_OVER);
      this.sound("buzz");
    }
  }

  cleanup() {
    // Reset UI
    broadcast(SCORE_UPDATE, 0);
    broadcast(LEVEL_UPDATE, 0);
    broadcast(LINES_UPDATE, 0);
  }

  getPiece() {
    return {
      ...PIECES[this.sequence.next().value],
      step: 0,
      get positions() {
        return this.rotation[this.step];
      },
    };
  }

  setGhostPiece() {
    const piece = { ...this.livePiece };
    do {
      this.ghostPieceRow = piece.row++;
    } while (pieceFits(this.board, piece));
  }

  lock() {
    // Live piece's lowest row
    const row = this.livePiece.row + this.livePiece.positions[3][1];

    // Add live piece to the board
    this.livePiece.positions.forEach(([x, y]) => {
      this.board[
        (this.livePiece.row + y) * COLUMNS + this.livePiece.column + x
      ] = this.livePiece.id;
    });

    // Copy live piece block positions for lock effect
    const blocks = this.livePiece.positions.map(([x, y]) => [
      x + this.livePiece.column,
      y + this.livePiece.row,
    ]);

    // Live piece is locked
    this.livePiece = null;

    // Lock effect (white flash), drawn by renderer
    this.lockFlash = { blocks, framesLeft: LOCK_FLASH_FRAMES };

    // See if we cleared any lines
    const top = Math.max(0, row - 3);
    for (let rowIdx = row; rowIdx >= top; rowIdx--) {
      if (this.lineClearCheck(rowIdx)) {
        // Store line indices bottom up
        this.cleared.push(rowIdx);
      }
    }

    // If no lines were cleared just set spawn delay
    if (!this.cleared.length) {
      this.sound("lock");
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
    if (lines === 4) {
      this.sound("clear4");
    } else {
      this.sound("clear");
    }

    // Score
    // https://tetris.wiki/Scoring
    broadcast(
      SCORE_UPDATE,
      (this.score += (this.level + 1) * [40, 100, 300, 1200][lines - 1]),
    );

    // Lines
    broadcast(LINES_UPDATE, (this.lines += lines));

    // Level
    if (this.lines >= this.nextLevelUp) {
      this.sound("levelUp");
      broadcast(LEVEL_UPDATE, ++this.level);
      this.delay = GRAVITY_TABLE[this.level] || 1;
      this.nextLevelUp += 10;
    }

    this.notify();
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
  }

  lineClearCheck(rowIdx) {
    const [start, end] = [rowIdx * COLUMNS, (rowIdx + 1) * COLUMNS];
    for (let i = start; i < end; i++) {
      if (this.board[i] === 0) return false;
    }
    return true;
  }

  // Remove a cleared line from the board
  deleteLine(rowIdx) {
    // Everything before the beginning of that line shifts by 1 row
    for (let i = rowIdx * COLUMNS - 1; i >= 0; i--) {
      this.board[i + COLUMNS] = this.board[i];
    }

    // Zero out 1st row
    for (let i = 0; i < COLUMNS; i++) {
      this.board[i] = 0;
    }
  }

  // Clockwise
  rotateRight() {
    if (this.livePiece) {
      const step = this.livePiece.step;
      this.livePiece.step = (this.livePiece.step + 1) % 4;
      if (pieceFits(this.board, this.livePiece)) {
        this.sound("tap");
        this.setGhostPiece();
      } else {
        this.livePiece.step = step;
      }
    }
  }

  // Counterclockwise
  rotateLeft() {
    if (this.livePiece) {
      const step = this.livePiece.step;
      this.livePiece.step = (this.livePiece.step + 3) % 4;
      if (pieceFits(this.board, this.livePiece)) {
        this.sound("tap");
        this.setGhostPiece();
      } else {
        this.livePiece.step = step;
      }
    }
  }

  moveLeft() {
    if (this.livePiece) {
      this.livePiece.column--;
      if (pieceFits(this.board, this.livePiece)) {
        this.sound("tap");
        this.setGhostPiece();
      } else {
        this.livePiece.column++;
      }
    }
  }

  moveRight() {
    if (this.livePiece) {
      this.livePiece.column++;
      if (pieceFits(this.board, this.livePiece)) {
        this.sound("tap");
        this.setGhostPiece();
      } else {
        this.livePiece.column--;
      }
    }
  }

  // Move down or lock
  moveDown() {
    if (this.livePiece) {
      if (this.livePiece.row < this.ghostPieceRow) {
        this.livePiece.row++;
        this.framesRemaining = this.delay;
      } else {
        this.lock();
      }
    }
  }

  // Handle keyboard events
  onkeydown(code) {
    switch (code) {
      case "KeyZ":
        this.rotateLeft();
        break;
      case "KeyX":
      case "ArrowUp":
        this.rotateRight();
        break;
      case "ArrowLeft":
        this.moveLeft();
        this.leftDasOn = true;
        this.rightDasOn = false;
        this.leftDasFramesLeft = DAS_DELAY;
        break;
      case "ArrowDown":
        this.moveDown();
        this.softDropOn = true;
        this.softDropFramesLeft = SOFT_DROP_FRAMES;
        break;
      case "ArrowRight":
        this.moveRight();
        this.rightDasOn = true;
        this.leftDasOn = false;
        this.rightDasFramesLeft = DAS_DELAY;
        break;
      case "Space":
        // Hard drop
        if (this.livePiece) {
          this.livePiece.row = this.ghostPieceRow;
          this.lock();
        }
        break;
      default:
        // Do nothing
        console.log(`${code} key not supported`);
        return false;
    }
    return true;
  }

  keyup(code) {
    switch (code) {
      case "ArrowLeft":
        this.leftDasOn = false;
        break;
      case "ArrowDown":
        this.softDropOn = false;
        break;
      case "ArrowRight":
        this.rightDasOn = false;
        break;
      default:
        // Do nothing
        return;
    }
  }
}

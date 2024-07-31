import { drawBoard, drawPieceInBox } from "./drawing";
import Piece from "./piece";
import { BOARD_SIZE } from "./constants";
import { clearCanvas } from "./utils";

/**  Useful links
 *
 * https://harddrop.com/wiki/Tetris_(NES,_Nintendo)
 * https://harddrop.com/wiki/Tetris_(Game_Boy)
 *
 **/

// Frames per drop by level
const GRAVITY_TABLE = [
  48, 43, 38, 33, 28, 23, 18, 13, 8, 6, 5, 5, 5, 4, 4, 4, 3, 3, 3, 2, 2, 2, 2,
  2, 2, 2, 2, 2, 2, 1,
];

// Game board aka playfield
const board = new Array(BOARD_SIZE).fill(0);

// Game data
let intervalID,
  gameCanvas,
  gameCanvasCtx,
  previewCanvas,
  previewCanvasCtx,
  cycleLength,
  framesRemaining,
  level,
  // lines = 0,
  // score = 0,
  // DAS = 0,
  currentPiece,
  nextPiece,
  hasChanged = false;

// Game loop stub
function frame() {
  // testing: update score every 60 frames
  // if (frameCount % 60 === 0) {
  //   window.dispatchEvent(
  //     new CustomEvent(SCORE_UPDATE_EVENT, {
  //       detail: frameCount,
  //     })
  //   );
  // }

  // Needs repaint?
  if (hasChanged) {
    requestAnimationFrame(repaint);
  }

  if (!framesRemaining) {
    // PIECE DISAPPEARS IF REACHES BOTTOM
    if (currentPiece.position > BOARD_SIZE) {
      clearPieceFromBoard(currentPiece, board);
      getNewPiece();
    } else {
      // Save current state
      const previous = snapshot(currentPiece);

      // Piece drops one row
      currentPiece.moveDown();

      // Update board
      clearPieceFromBoard(previous, board);
      addPieceToBoard(currentPiece, board);
    }

    // Reset cycle
    framesRemaining = cycleLength;

    hasChanged = true;
  }

  // Cycle frame counter
  framesRemaining--;
}

function init() {
  // Set up playfield
  gameCanvas = document.getElementById("playfield");
  gameCanvasCtx = gameCanvas.getContext("2d");

  // Set up next piece box
  previewCanvas = document.getElementById("preview");
  previewCanvasCtx = previewCanvas.getContext("2d");
}

export function start(startingLevel = 0) {
  // Init if needed
  !gameCanvas && init();

  // Set up level and speed
  level = startingLevel;
  cycleLength = GRAVITY_TABLE[level] || 1;
  framesRemaining = cycleLength;

  // Set up pieces
  getNewPiece();

  // testing
  // randomFill(gameCanvasCtx);

  // Request repaint
  hasChanged = true;

  // Go!
  run();
}

// Both NES and GameBoy run at roughly 60 frames per second
export function run() {
  intervalID = setInterval(frame, 1000 / 60);
}

export function stop() {
  clearInterval(intervalID);
}

export function reset() {
  // score = 0;
  // level = 0;
  // lines = 0;
  clearCanvas(gameCanvas);
  clearCanvas(previewCanvas);
  board.fill(0);
}

function getNewPiece() {
  // Pick current piece
  currentPiece = nextPiece || Piece.getRandom();

  // Add piece to board
  addPieceToBoard(currentPiece, board);

  // Pick next piece
  nextPiece = Piece.getRandom();

  // Show next piece
  clearCanvas(previewCanvas);
  drawPieceInBox(previewCanvasCtx, nextPiece);
}

function repaint() {
  clearCanvas(gameCanvas);
  drawBoard(gameCanvasCtx, board);
}

function addPieceToBoard(piece, board) {
  piece.state.forEach((index) => {
    board[piece.position + index] = piece.name;
  });
}

function clearPieceFromBoard(piece, board) {
  piece.state.forEach((index) => {
    board[piece.position + index] = 0;
  });
}

function snapshot(piece) {
  return {
    position: piece.position,
    state: piece.state,
  };
}

// Rough draft, will need to add checks, etc...
export function move(keyCode) {
  // Save current state
  const previous = snapshot(currentPiece);

  switch (keyCode) {
    case "KeyZ":
      currentPiece.canSpin() && currentPiece.rotateCCW();
      break;
    case "KeyX":
    case "ArrowUp":
      currentPiece.canSpin() && currentPiece.rotateCW();
      break;
    case "ArrowLeft":
      !currentPiece.touchesLeftWall() && currentPiece.moveLeft();
      break;
    case "ArrowDown":
      currentPiece.moveDown();
      break;
    case "ArrowRight":
      !currentPiece.touchesRightWall() && currentPiece.moveRight();
      break;
    default:
      // Do nothing
      console.log(`${keyCode} not supported`);
      return;
  }

  // Update board
  clearPieceFromBoard(previous, board);
  addPieceToBoard(currentPiece, board);

  hasChanged = true;
}

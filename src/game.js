import { randomFill, drawBoard, drawPieceInBox } from "./drawing";
import Piece from "./piece";
import { SCORE_UPDATE_EVENT } from "./constants";
import { clearCanvas } from "./utils";

/**  Useful links
 *
 * https://harddrop.com/wiki/Tetris_(NES,_Nintendo)
 * https://harddrop.com/wiki/Tetris_(Game_Boy)
 *
 **/

// Game board aka playfield
// x: board index
// i: playfield row number
// x = 22 - i
const board = Array.from({ length: 22 }, () => new Array(10).fill(0));

// Game data
let intervalID,
  gameCanvas,
  gameCanvasCtx,
  nextPieceCanvas,
  nextPieceCanvasCtx,
  frameCount = 0,
  // score = 0,
  // level = 0,
  // lines = 0,
  currentPiece,
  nextPiece,
  hasChanged = false;

// Game loop stub
function frame() {
  // testing
  // console.log(frameCount);

  // testing: update score every 60 frames
  if (frameCount % 60 === 0) {
    window.dispatchEvent(
      new CustomEvent(SCORE_UPDATE_EVENT, {
        detail: frameCount,
      })
    );
  }

  // testing: update position every 48 frames
  if (frameCount % 48 === 0) {
    // try to move piece down
  }

  // Needs repaint?
  if (hasChanged) {
    requestAnimationFrame(repaint);
  }

  // Increment frame count
  frameCount++;
}

export function init() {
  // Set up playfield
  gameCanvas = document.getElementById("gameCanvas");
  gameCanvasCtx = gameCanvas.getContext("2d");

  // Pick first piece
  currentPiece = Piece.getRandom();

  // Add piece to board
  addPieceToBoard(currentPiece, board);

  console.log(board);

  // Set up next piece box
  nextPieceCanvas = document.getElementById("nextPieceCanvas");
  nextPieceCanvasCtx = nextPieceCanvas.getContext("2d");

  // Pick next piece
  nextPiece = Piece.getRandom();

  // Show next piece
  drawPieceInBox(nextPieceCanvasCtx, nextPiece);

  // testing
  // randomFill(gameCanvasCtx);

  // Request repaint
  hasChanged = true;
}

// Both NES and GameBoy run at roughly 60 frames per second
export function run() {
  intervalID = setInterval(frame, 1000 / 60);
}

export function start() {
  init();
  run();
}

export function stop() {
  clearInterval(intervalID);
}

export function reset() {
  frameCount = 0;
  // score = 0;
  // level = 0;
  // lines = 0;
  clearCanvas(gameCanvas);
  clearCanvas(nextPieceCanvas);
  board.forEach((row) => row.fill(0));
}

function repaint() {
  clearCanvas(gameCanvas);
  drawBoard(gameCanvasCtx, board);
}

function addPieceToBoard(piece, board) {
  piece.rotationState.forEach((value) => {
    const [column, row] = [value % 4, Math.trunc(value / 4)];
    board[row + piece.y][column + piece.x] = piece.name;
  });
}

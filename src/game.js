import { randomFill, drawPiece, clearCanvas } from "./drawing";
import { randomPiece } from "./pieces";
import { SCORE_UPDATE_EVENT } from "./constants";

/**  Useful links
 *
 * https://harddrop.com/wiki/Tetris_(NES,_Nintendo)
 * https://harddrop.com/wiki/Tetris_(Game_Boy)
 *
 **/

// Game board aka playfield
const board = new Array(22).fill(new Array(10).fill(0));

// Game data
let intervalID,
  gameCanvas,
  gameCanvasCtx,
  nextPieceCanvas,
  nextPieceCanvasCtx,
  frameCount = 0,
  score = 0,
  level = 0,
  lines = 0,
  currentPiece,
  nextPiece,
  position;

// Game loop stub
function frame() {
  // testing
  console.log(frameCount);

  // testing
  if (frameCount % 60 === 0) {
    window.dispatchEvent(
      new CustomEvent(SCORE_UPDATE_EVENT, {
        detail: frameCount,
      })
    );
  }

  // Increment frame count
  frameCount++;
}

export function init() {
  gameCanvas = document.getElementById("gameCanvas");
  gameCanvasCtx = gameCanvas.getContext("2d");

  currentPiece = randomPiece();
  nextPiece = randomPiece();

  nextPieceCanvas = document.getElementById("nextPieceCanvas");
  nextPieceCanvasCtx = nextPieceCanvas.getContext("2d");

  drawNextPiece();

  position = spawn(currentPiece);

  // testing
  randomFill(gameCanvasCtx);
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
  score = 0;
  level = 0;
  lines = 0;
  clearCanvas(gameCanvas);
  clearCanvas(nextPieceCanvas);
}

function spawn(piece) {
  // Our indices are 0 based hence 1 less than what is usually mentioned
  return piece.name === "i" ? [3, 21] : [4, 20];
}

function drawNextPiece() {
  clearCanvas(nextPieceCanvas);
  drawPiece(nextPiece, nextPieceCanvasCtx);
}

import { BOARD_COLS } from "./constants";
import PIECE_TYPES from "./pieceTypes";

export default class Piece {
  static getRandom() {
    return new Piece(PIECE_TYPES[Math.trunc(Math.random() * 7)]);
  }

  constructor({ name, states, spawn, noSpinZone, offset }) {
    this.name = name;
    this.states = states;
    this.stateIdx = 0;

    // Starting position (board index)
    this.position = spawn;

    // Positions where a wall prevents rotation
    this.noSpinZone = noSpinZone;

    // For centering in preview box
    this.offset = offset;
  }

  touchesLeftWall() {
    return this.state.some((i) => (i + this.position) % BOARD_COLS === 0);
  }

  touchesRightWall() {
    return this.state.some((i) => (i + this.position + 1) % BOARD_COLS === 0);
  }

  canSpin() {
    // Add BOARD_COLS to avoid negative values in 1st row
    return !this.noSpinZone.includes((this.position + BOARD_COLS) % BOARD_COLS);
  }

  rotateCW() {
    this.stateIdx++;
  }

  rotateCCW() {
    this.stateIdx--;
  }

  moveLeft() {
    this.position--;
  }

  moveRight() {
    this.position++;
  }

  moveDown() {
    this.position += BOARD_COLS;
  }

  get state() {
    return this.states.at(this.stateIdx % this.states.length);
  }
}

import { BOARD_COLS } from "./constants";
import PIECE_TYPES from "./pieceTypes";

export default class Piece {
  static random() {
    return new Piece(Object.values(PIECE_TYPES)[Math.trunc(Math.random() * 7)]);
  }

  constructor({ key, states, spawn, noSpinZone, offset }) {
    this.key = key;

    // Rotation
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

  cannotSpin() {
    // Add BOARD_COLS to avoid negative values in 1st row
    return this.noSpinZone.includes((this.position + BOARD_COLS) % BOARD_COLS);
  }

  get state() {
    return this.states[this.stateIdx];
  }

  get baseRow() {
    // State indices are sorted so 4th block is always on "lowest" row
    return Math.trunc((this.state[3] + this.position) / BOARD_COLS);
  }
}

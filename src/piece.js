import PIECE_TYPES from "./pieceTypes";

export default class Piece {
  static getRandom() {
    return new Piece(PIECE_TYPES[Math.trunc(Math.random() * 7)]);
  }

  constructor({ name, rotation, spawn, offset }) {
    this.name = name;
    this.rotation = rotation;
    this.rotationIdx = 0;

    // Starting position
    [this.x, this.y] = spawn;

    // For centering in next piece box
    this.offset = offset;
  }

  rotateCW() {
    this.rotationIdx++;
  }

  get rotationState() {
    return this.rotation.at(this.rotationIdx % this.rotation.length);
  }
}

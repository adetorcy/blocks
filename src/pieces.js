import { CYAN, YELLOW, BLUE, ORANGE, GREEN, MAGENTA, RED } from "./colors";

/***

https://harddrop.com/wiki/Nintendo_Rotation_System

Each piece has 4 hardcoded rotation states (possibly repeated)
with each rotation state made of 4 pairs of (x,y) coordinates

0,0  1,0  2,0  3,0
0,1  1,1  2,1  3,1
0,2  1,2  2,2  3,2
0,3  1,3  2,3  3,3

List blocks top to bottom, left to right

***/

const I_PIECE = {
  id: 1,
  color: CYAN,
  rotation: [
    [
      [0, 2],
      [1, 2],
      [2, 2],
      [3, 2],
    ],
    [
      [2, 0],
      [2, 1],
      [2, 2],
      [2, 3],
    ],
    [
      [0, 2],
      [1, 2],
      [2, 2],
      [3, 2],
    ],
    [
      [2, 0],
      [2, 1],
      [2, 2],
      [2, 3],
    ],
  ],
  column: 3,
  row: 0,
  offset: [0, -0.5],
};

const O_PIECE = {
  id: 2,
  color: YELLOW,
  rotation: [
    [
      [1, 1],
      [2, 1],
      [1, 2],
      [2, 2],
    ],
    [
      [1, 1],
      [2, 1],
      [1, 2],
      [2, 2],
    ],
    [
      [1, 1],
      [2, 1],
      [1, 2],
      [2, 2],
    ],
    [
      [1, 1],
      [2, 1],
      [1, 2],
      [2, 2],
    ],
  ],
  column: 3,
  row: 1,
  offset: [0, 0],
};

const J_PIECE = {
  id: 3,
  color: BLUE,
  rotation: [
    [
      [0, 1],
      [1, 1],
      [2, 1],
      [2, 2],
    ],
    [
      [1, 0],
      [1, 1],
      [0, 2],
      [1, 2],
    ],
    [
      [0, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    [
      [1, 0],
      [2, 0],
      [1, 1],
      [1, 2],
    ],
  ],
  column: 4,
  row: 1,
  offset: [0.5, 0],
};

const L_PIECE = {
  id: 4,
  color: ORANGE,
  rotation: [
    [
      [0, 1],
      [1, 1],
      [2, 1],
      [0, 2],
    ],
    [
      [0, 0],
      [1, 0],
      [1, 1],
      [1, 2],
    ],
    [
      [2, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    [
      [1, 0],
      [1, 1],
      [1, 2],
      [2, 2],
    ],
  ],
  column: 4,
  row: 1,
  offset: [0.5, 0],
};

const S_PIECE = {
  id: 5,
  color: GREEN,
  rotation: [
    [
      [1, 1],
      [2, 1],
      [0, 2],
      [1, 2],
    ],
    [
      [1, 0],
      [1, 1],
      [2, 1],
      [2, 2],
    ],
    [
      [1, 1],
      [2, 1],
      [0, 2],
      [1, 2],
    ],
    [
      [1, 0],
      [1, 1],
      [2, 1],
      [2, 2],
    ],
  ],
  column: 4,
  row: 1,
  offset: [0.5, 0],
};

const T_PIECE = {
  id: 6,
  color: MAGENTA,
  rotation: [
    [
      [0, 1],
      [1, 1],
      [2, 1],
      [1, 2],
    ],
    [
      [1, 0],
      [0, 1],
      [1, 1],
      [1, 2],
    ],
    [
      [1, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    [
      [1, 0],
      [1, 1],
      [2, 1],
      [1, 2],
    ],
  ],
  column: 4,
  row: 1,
  offset: [0.5, 0],
};

const Z_PIECE = {
  id: 7,
  color: RED,
  rotation: [
    [
      [0, 1],
      [1, 1],
      [1, 2],
      [2, 2],
    ],
    [
      [2, 0],
      [1, 1],
      [2, 1],
      [1, 2],
    ],
    [
      [0, 1],
      [1, 1],
      [1, 2],
      [2, 2],
    ],
    [
      [2, 0],
      [1, 1],
      [2, 1],
      [1, 2],
    ],
  ],
  column: 4,
  row: 1,
  offset: [0.5, 0],
};

const PIECES = [I_PIECE, O_PIECE, J_PIECE, L_PIECE, S_PIECE, T_PIECE, Z_PIECE];

export default PIECES;

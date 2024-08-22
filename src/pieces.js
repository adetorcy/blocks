/*

https://harddrop.com/wiki/Nintendo_Rotation_System

Each piece has 4 hardcoded rotation states (possibly repeated)
with each rotation state made of 4 pairs of (x,y) coordinates

0,0  1,0  2,0  3,0
0,1  1,1  2,1  3,1
0,2  1,2  2,2  3,2
0,3  1,3  2,3  3,3

List blocks top to bottom, left to right

*/

const I_PIECE = {
  id: 1,
  color: "cyan",
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
  color: "yellow",
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
  color: "blue",
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
  color: "orange",
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
  color: "lime",
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
  color: "magenta",
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
  color: "red",
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

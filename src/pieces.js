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
  key: 1,
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
  spawn: [3, 0],
  offset: [0, -0.5],
};

const O_PIECE = {
  key: 2,
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
  spawn: [3, 1],
  offset: [0, 0],
};

const J_PIECE = {
  key: 3,
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
  spawn: [4, 1],
  offset: [0.5, 0],
};

const L_PIECE = {
  key: 4,
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
  spawn: [4, 1],
  offset: [0.5, 0],
};

const S_PIECE = {
  key: 5,
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
  spawn: [4, 1],
  offset: [0.5, 0],
};

const T_PIECE = {
  key: 6,
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
  spawn: [4, 1],
  offset: [0.5, 0],
};

const Z_PIECE = {
  key: 7,
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
  spawn: [4, 1],
  offset: [0.5, 0],
};

const PIECES = {
  [I_PIECE.key]: I_PIECE,
  [O_PIECE.key]: O_PIECE,
  [J_PIECE.key]: J_PIECE,
  [L_PIECE.key]: L_PIECE,
  [S_PIECE.key]: S_PIECE,
  [T_PIECE.key]: T_PIECE,
  [Z_PIECE.key]: Z_PIECE,
};

export default PIECES;

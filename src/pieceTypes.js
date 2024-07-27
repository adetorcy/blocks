// https://harddrop.com/wiki/Nintendo_Rotation_System

/*

Visualize piece in 4x4 grid

0   1   2   3
4   5   6   7
8   9   10  11
12  13  14  15

x = value % 4
y = value // 4

*/

const I_PIECE = {
  name: "i",
  rotation: [
    [8, 9, 10, 11],
    [2, 6, 10, 14],
  ],
  spawn: [3, 0],
  offset: [0, -0.5],
};

const O_PIECE = {
  name: "o",
  rotation: [[5, 6, 9, 10]],
  spawn: [4, 1],
  offset: [0, 0],
};

const J_PIECE = {
  name: "j",
  rotation: [
    [4, 5, 6, 10],
    [1, 5, 8, 9],
    [0, 4, 5, 6],
    [1, 2, 5, 9],
  ],
  spawn: [4, 1],
  offset: [0.5, 0],
};

const L_PIECE = {
  name: "l",
  rotation: [
    [4, 5, 6, 8],
    [0, 1, 5, 9],
    [2, 4, 5, 6],
    [1, 5, 9, 10],
  ],
  spawn: [4, 1],
  offset: [0.5, 0],
};

const S_PIECE = {
  name: "s",
  rotation: [
    [5, 6, 8, 9],
    [1, 5, 6, 10],
  ],
  spawn: [4, 1],
  offset: [0.5, 0],
};

const T_PIECE = {
  name: "t",
  rotation: [
    [4, 5, 6, 9],
    [1, 4, 5, 9],
    [1, 4, 5, 6],
    [1, 5, 6, 9],
  ],
  spawn: [4, 1],
  offset: [0.5, 0],
};

const Z_PIECE = {
  name: "z",
  rotation: [
    [4, 5, 9, 10],
    [2, 5, 6, 9],
  ],
  spawn: [4, 1],
  offset: [0.5, 0],
};

const PIECE_TYPES = [
  I_PIECE,
  O_PIECE,
  J_PIECE,
  L_PIECE,
  S_PIECE,
  T_PIECE,
  Z_PIECE,
];

export default PIECE_TYPES;

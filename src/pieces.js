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

export const I_PIECE = {
  name: "i",
  color: "cyan",
  rotation: [
    [8, 9, 10, 11],
    [2, 6, 10, 14],
  ],
};

export const O_PIECE = {
  name: "o",
  color: "yellow",
  rotation: [[5, 6, 9, 10]],
};

export const J_PIECE = {
  name: "j",
  color: "blue",
  rotation: [
    [4, 5, 6, 10],
    [1, 5, 8, 9],
    [0, 4, 5, 6],
    [1, 2, 5, 9],
  ],
};

export const L_PIECE = {
  name: "l",
  color: "orange",
  rotation: [
    [4, 5, 6, 8],
    [0, 1, 5, 9],
    [2, 4, 5, 6],
    [1, 5, 9, 10],
  ],
};

export const S_PIECE = {
  name: "s",
  color: "lime",
  rotation: [
    [5, 6, 8, 9],
    [1, 5, 6, 10],
  ],
};

export const T_PIECE = {
  name: "t",
  color: "magenta",
  rotation: [
    [4, 5, 6, 9],
    [1, 4, 5, 9],
    [1, 4, 5, 6],
    [1, 5, 6, 9],
  ],
};

export const Z_PIECE = {
  name: "z",
  color: "red",
  rotation: [
    [4, 5, 9, 10],
    [2, 5, 6, 9],
  ],
};

export function randomPiece() {
  return [J_PIECE, L_PIECE, I_PIECE, O_PIECE, S_PIECE, T_PIECE, Z_PIECE][
    Math.trunc(Math.random() * 7)
  ];
}

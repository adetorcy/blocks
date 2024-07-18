// https://harddrop.com/wiki/Nintendo_Rotation_System
// Start with GB style aka left handed

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
  color: "cyan",
  rotation: [
    [4, 5, 6, 7],
    [1, 5, 9, 13],
  ],
};

export const O_PIECE = {
  color: "yellow",
  rotation: [[5, 6, 9, 10]],
};

export const J_PIECE = {
  color: "blue",
  rotation: [
    [4, 5, 6, 10],
    [1, 5, 8, 9],
    [0, 4, 5, 6],
    [1, 2, 5, 9],
  ],
};

export const L_PIECE = {
  color: "orange",
  rotation: [
    [4, 5, 6, 8],
    [0, 1, 5, 9],
    [2, 4, 5, 6],
    [1, 5, 9, 10],
  ],
};

export const S_PIECE = {
  color: "lime",
  rotation: [
    [5, 6, 8, 9],
    [0, 4, 5, 9],
  ],
};

export const T_PIECE = {
  color: "magenta",
  rotation: [
    [4, 5, 6, 9],
    [1, 4, 5, 9],
    [1, 4, 5, 6],
    [1, 5, 6, 9],
  ],
};

export const Z_PIECE = {
  color: "red",
  rotation: [
    [4, 5, 9, 10],
    [1, 4, 5, 8],
  ],
};

export function randomPiece() {
  return [J_PIECE, L_PIECE, I_PIECE, O_PIECE, S_PIECE, T_PIECE, Z_PIECE][
    Math.trunc(Math.random() * 7)
  ];
}

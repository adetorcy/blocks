import { BOARD_COLS } from "./constants";

/*

One flat array represents the 10x22 board:

0   1   2   3   4   5   6   7   8   9
10  11  12  13  14  15  16  17  18  19
20  21  22  23  24  25  26  27  28  29
30  31  32  33  34  35  36  37  38  39
...

column = index % 10
row = index // 10


Rotation states: https://harddrop.com/wiki/Nintendo_Rotation_System

Repeat rotation states for I, O, Z and S so rotation length can be hardcoded to 4
List state indices in ascending order so last block is always on base row

*/

const I_PIECE = {
  key: 1,
  color: "cyan",
  states: [
    [20, 21, 22, 23],
    [2, 12, 22, 32],
    [20, 21, 22, 23],
    [2, 12, 22, 32],
  ],
  spawn: 3,
  noSpinZone: [BOARD_COLS - 3, BOARD_COLS - 2, BOARD_COLS - 1],
  offset: [0, -0.5],
};

const O_PIECE = {
  key: 2,
  color: "yellow",
  states: [
    [11, 12, 21, 22],
    [11, 12, 21, 22],
    [11, 12, 21, 22],
    [11, 12, 21, 22],
  ],
  spawn: 13,
  noSpinZone: [],
  offset: [0, 0],
};

const J_PIECE = {
  key: 3,
  color: "blue",
  states: [
    [10, 11, 12, 22],
    [1, 11, 20, 21],
    [0, 10, 11, 12],
    [1, 2, 11, 21],
  ],
  spawn: 14,
  noSpinZone: [BOARD_COLS - 2, BOARD_COLS - 1],
  offset: [0.5, 0],
};

const L_PIECE = {
  key: 4,
  color: "orange",
  states: [
    [10, 11, 12, 20],
    [0, 1, 11, 21],
    [2, 10, 11, 12],
    [1, 11, 21, 22],
  ],
  spawn: 14,
  noSpinZone: [BOARD_COLS - 2, BOARD_COLS - 1],
  offset: [0.5, 0],
};

const S_PIECE = {
  key: 5,
  color: "lime",
  states: [
    [11, 12, 20, 21],
    [1, 11, 12, 22],
    [11, 12, 20, 21],
    [1, 11, 12, 22],
  ],
  spawn: 14,
  noSpinZone: [BOARD_COLS - 1],
  offset: [0.5, 0],
};

const T_PIECE = {
  key: 6,
  color: "magenta",
  states: [
    [10, 11, 12, 21],
    [1, 10, 11, 21],
    [1, 10, 11, 12],
    [1, 11, 12, 21],
  ],
  spawn: 14,
  noSpinZone: [BOARD_COLS - 2, BOARD_COLS - 1],
  offset: [0.5, 0],
};

const Z_PIECE = {
  key: 7,
  color: "red",
  states: [
    [10, 11, 21, 22],
    [2, 11, 12, 21],
    [10, 11, 21, 22],
    [2, 11, 12, 21],
  ],
  spawn: 14,
  noSpinZone: [BOARD_COLS - 1],
  offset: [0.5, 0],
};

const PIECE_TYPES = {
  [I_PIECE.key]: I_PIECE,
  [O_PIECE.key]: O_PIECE,
  [J_PIECE.key]: J_PIECE,
  [L_PIECE.key]: L_PIECE,
  [S_PIECE.key]: S_PIECE,
  [T_PIECE.key]: T_PIECE,
  [Z_PIECE.key]: Z_PIECE,
};

export default PIECE_TYPES;

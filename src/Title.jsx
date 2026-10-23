import { LEVEL_COLORS } from "./colors";

// BLOCKS as in the Blocks font (Blocks6px.txt), without the spacing column
const LETTERS = [
  ["##.", "#.#", "##.", "#.#", "###"],
  ["#.", "#.", "#.", "#.", "##"],
  [".##", "#.#", "#.#", "#.#", "##."],
  ["##", "#.", "#.", "#.", "##"],
  ["#.#", "#.#", "##.", "#.#", "#.#"],
  [".##", "#..", "###", "..#", "###"],
];

// One block per font pixel, letters one column apart
// Letters take the first level colors: I, S, T, L, O, Z
const BLOCKS = [];
let column = 0;
LETTERS.forEach((rows, i) => {
  rows.forEach((row, y) =>
    [...row].forEach((pixel, x) => {
      if (pixel === "#") {
        BLOCKS.push({ x: column + x, y, color: LEVEL_COLORS[i] });
      }
    }),
  );
  column += rows[0].length + 1;
});

// GAME OF FALLING over BLOCKS made of blocks, at the top of the home page
// The intro class on a parent plays its intro (style.css)
export default function Title() {
  return (
    <div className="title">
      <div className="title-text">GAME OF FALLING</div>
      <div className="title-blocks">
        {BLOCKS.map(({ x, y, color }) => (
          <div
            key={`${x},${y}`}
            className="title-block"
            style={{ "--x": x, "--y": y, color }}
          ></div>
        ))}
      </div>
    </div>
  );
}

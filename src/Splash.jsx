import { useRef } from "react";
import useFitScale from "./useFitScale";
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

export default function Splash() {
  const ref = useRef(null);
  useFitScale(ref);

  return (
    <div className="splash-screen">
      <div ref={ref} className="splash">
        <div className="splash-text">GAME OF FALLING</div>
        <div className="splash-blocks">
          {BLOCKS.map(({ x, y, color }) => (
            <div
              key={`${x},${y}`}
              className="splash-block"
              style={{ "--x": x, "--y": y, color }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}

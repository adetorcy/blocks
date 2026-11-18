import { useEffect, useRef, useState } from "react";
import { listenForMenuInput } from "./input";
import { centeredLeft } from "./text";
import { LEVEL_COLORS, YELLOW } from "./colors";
import { OK_DELAY, TARGET_LINES } from "./constants";

const TITLES = { win: "YOU WIN!", lose: "YOU LOSE", draw: "DRAW" };
const REASONS = {
  finish: `REACHED ${TARGET_LINES} LINES`,
  topOut: "TOPPED OUT",
  // "The game" fills the line under a short name
  forfeit: "FORFEITED THE GAME",
};

// The window's middle in the game area (left 44, 320 wide with the outline)
const MIDDLE = 204;
// Where its text starts in the game area, 20px in (outline and padding)
const INSET = 64;

// YOU WIN!: the title bar steps through the piece colors once, 0.1s each
// In piece order (the first 7 level colors), then it stays yellow (O)
// Small and short, under the flash threshold, none with reduced motion
const WIN_BAR = [...LEVEL_COLORS.slice(0, 7), YELLOW].map((color) => ({
  backgroundColor: color,
  easing: "step-end",
}));

// 2P result over the board, OK goes back to VS for another match
// What happened, with who did it unless it was you (the title says so)
// Wait a bit before showing OK and calling ok()
// So we don't accidentally hit OK before we've
// had the chance to see the result
export default function ResultMenu({ result, opponentName, ok }) {
  const titleRef = useRef(null);
  const [ready, setReady] = useState(false);
  const { outcome, who, reason } = result;
  const lines = [
    { you: null, opponent: opponentName, both: "BOTH" }[who],
    REASONS[reason],
  ].filter(Boolean);

  useEffect(() => {
    const timeoutID = setTimeout(() => setReady(true), OK_DELAY);
    return () => clearTimeout(timeoutID);
  }, []);

  useEffect(() => {
    if (!ready) return;

    function handleMenuInput(input, repeat) {
      // Ignore auto-repeat from a held key
      if (input === "confirm" && !repeat) ok();
    }

    return listenForMenuInput(handleMenuInput);
  }, [ok, ready]);

  useEffect(() => {
    if (outcome !== "win") return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const animation = titleRef.current.animate(WIN_BAR, {
      duration: (WIN_BAR.length - 1) * 100,
    });
    return () => animation.cancel();
  }, [outcome]);

  return (
    <div className={`stack menu menu-box menu-result ${outcome}`}>
      <div
        ref={titleRef}
        className="menu-title"
        style={outcome === "win" ? { backgroundColor: YELLOW } : null}
      >
        {TITLES[outcome]}
      </div>
      <div className="stack result-lines">
        {lines.map((line) => (
          <div
            key={line}
            style={{ marginLeft: centeredLeft(line, MIDDLE) - INSET }}
          >
            {line}
          </div>
        ))}
      </div>
      <div
        className={`menu-option ${ready ? "selected" : "disabled"}`}
        onClick={ready ? ok : undefined}
      >
        OK
      </div>
    </div>
  );
}

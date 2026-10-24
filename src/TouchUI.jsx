import { useState } from "react";
import ActionButtons from "./ActionButtons";
import DPad from "./DPad";
import { pressButton, releaseButton } from "./input";

export default function TouchUI() {
  // On by default on touch devices
  const [isVisible, setIsVisible] = useState(
    () => window.matchMedia("(pointer: coarse)").matches,
  );

  function toggleIsVisible() {
    setIsVisible((x) => !x);
  }

  return (
    <>
      <div
        className="touch-ui"
        // Hidden controls can't be tapped or keep focus
        // So Enter or Space can't press a hidden button at game over
        hidden={!isVisible}
        // A long press would open the context menu
        onContextMenu={(event) => event.preventDefault()}
      >
        <div className="grip left">
          <DPad />
        </div>
        <div className="grip right">
          <div className="face">
            <ActionButtons />
            <button
              className="start-btn"
              onPointerDown={() => pressButton("START")}
              onPointerUp={() => releaseButton("START")}
              onPointerLeave={() => releaseButton("START")}
            >
              <span className="start-btn-pill" />
              Start
            </button>
          </div>
        </div>
      </div>
      {/* Outside the controls so it stays when they're hidden */}
      <button
        className="touch-ui-toggle"
        aria-expanded={isVisible}
        onClick={toggleIsVisible}
        // No focus on click or Space and Enter would press it again later
        onMouseDown={(event) => event.preventDefault()}
        onContextMenu={(event) => event.preventDefault()}
      >
        {isVisible ? "Hide controls" : "Show controls"}
      </button>
    </>
  );
}

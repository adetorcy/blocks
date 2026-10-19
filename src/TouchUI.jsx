import { useEffect, useRef, useState } from "react";
import ActionButtons from "./ActionButtons";
import DPad from "./DPad";
import { dispatchKeyDown, dispatchKeyUp } from "./utils";

export default function TouchUI({ menu }) {
  // On by default on touch devices
  const [isVisible, setIsVisible] = useState(
    () => window.matchMedia("(pointer: coarse)").matches,
  );

  // START highlight: Enter is held and the game pauses or resumes
  const startBtnRef = useRef(null);
  const enterDownRef = useRef(false);
  const prevMenuRef = useRef(menu);

  function toggleIsVisible() {
    setIsVisible((x) => !x);
  }

  useEffect(() => {
    function handleKeydown(event) {
      // Highlight is added when the game pauses or resumes, see below
      if (event.code === "Enter") enterDownRef.current = true;
    }

    function handleKeyup(event) {
      if (event.code !== "Enter") return;

      enterDownRef.current = false;
      startBtnRef.current.classList.remove("active");
    }

    // Only listen for physical keyboard events here
    window.addEventListener("keydown", handleKeydown);
    window.addEventListener("keyup", handleKeyup);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("keyup", handleKeyup);
    };
  }, []);

  // Highlight START only when Enter pauses or resumes the game,
  // not for other menu selections (start, quit, etc.)
  useEffect(() => {
    const prevMenu = prevMenuRef.current;
    prevMenuRef.current = menu;

    const paused = prevMenu === null && menu === "pause";
    const resumed = prevMenu === "pause" && menu === null;
    if ((paused || resumed) && enterDownRef.current) {
      startBtnRef.current.classList.add("active");
    }
  }, [menu]);

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
            <MappedButton className="start-btn" code="Enter" ref={startBtnRef}>
              <span className="start-btn-pill" />
              Start
            </MappedButton>
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

function MappedButton({ className, code, children, ref }) {
  return (
    <button
      {...{ className, ref }}
      onPointerDown={() => dispatchKeyDown({ code })}
      onPointerUp={() => dispatchKeyUp({ code })}
      onPointerLeave={() => dispatchKeyUp({ code })}
    >
      {children}
    </button>
  );
}

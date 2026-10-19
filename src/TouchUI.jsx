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
        className={isVisible ? "touch-ui visible" : "touch-ui"}
        // Inert when hidden so focus can't stay on a hidden button
        // Avoids clicking button with Enter or Space at game over
        inert={!isVisible}
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
        <button
          className="text-btn hide-touch-ui-btn"
          onClick={toggleIsVisible}
        >
          Hide controls
        </button>
      </div>
      {/* Takes the place of Hide controls, outside the controls so it stays */}
      <button
        className="text-btn show-touch-ui-btn"
        onClick={toggleIsVisible}
        inert={isVisible}
      >
        Show controls
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

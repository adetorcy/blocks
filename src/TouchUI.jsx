import { useEffect, useRef, useState } from "react";
import { Icon } from "@mdi/react";
import {
  mdiGestureTapButton,
  mdiDesktopTowerMonitor,
  mdiSwapHorizontal,
  mdiPauseCircleOutline,
  mdiCheckBold,
  mdiArrowCollapseDown,
  mdiRotateLeftVariant,
  mdiRotateRightVariant,
} from "@mdi/js";
import DPad from "./DPad";
import { dispatchKeyDown, dispatchKeyUp } from "./utils";

export default function TouchUI({ menu }) {
  // On by default on touch devices
  const [isVisible, setIsVisible] = useState(
    () => window.matchMedia("(pointer: coarse)").matches,
  );
  const [controllerStyleLayout, setControllerStyleLayout] = useState(true); // D-pad on the left

  // On-screen button references
  const pauseBtnRef = useRef(null);
  const rotateLeftBtnRef = useRef(null);
  const rotateRightBtnRef = useRef(null);
  const hardDropBtnRef = useRef(null);

  // Pause button highlight: Enter is held and the game pauses or resumes
  const enterDownRef = useRef(false);
  const prevMenuRef = useRef(menu);

  function toggleIsVisible() {
    setIsVisible((x) => !x);
  }

  function toggleLayout() {
    setControllerStyleLayout((x) => !x);
  }

  useEffect(() => {
    function handleKeydown(event) {
      switch (event.code) {
        case "KeyZ":
          rotateLeftBtnRef.current.classList.add("active");
          break;
        case "KeyX":
          rotateRightBtnRef.current.classList.add("active");
          break;
        case "Space":
          hardDropBtnRef.current.classList.add("active");
          break;
        case "Enter":
          // Highlight is added when the game pauses or resumes, see below
          enterDownRef.current = true;
          break;
      }
    }

    function handleKeyup(event) {
      switch (event.code) {
        case "KeyZ":
          rotateLeftBtnRef.current.classList.remove("active");
          break;
        case "KeyX":
          rotateRightBtnRef.current.classList.remove("active");
          break;
        case "Space":
          hardDropBtnRef.current.classList.remove("active");
          break;
        case "Enter":
          enterDownRef.current = false;
          pauseBtnRef.current.classList.remove("active");
          break;
      }
    }

    // Only listen for physical keyboard events here
    window.addEventListener("keydown", handleKeydown);
    window.addEventListener("keyup", handleKeyup);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("keyup", handleKeyup);
    };
  }, []);

  // Highlight pause button only when Enter pauses or resumes the game,
  // not for other menu selections (start, quit, etc.)
  useEffect(() => {
    const prevMenu = prevMenuRef.current;
    prevMenuRef.current = menu;

    const paused = prevMenu === null && menu === "pause";
    const resumed = prevMenu === "pause" && menu === null;
    if ((paused || resumed) && enterDownRef.current) {
      pauseBtnRef.current.classList.add("active");
    }
  }, [menu]);

  return (
    <>
      {isVisible || (
        <button
          className="icon-btn show-touch-ui-btn"
          onClick={toggleIsVisible}
        >
          <Icon path={mdiGestureTapButton} size={1} />
        </button>
      )}
      <div
        className={isVisible ? "touch-ui visible" : "touch-ui"}
        // Inert when hidden so focus can't stay on a hidden button
        // Avoids clicking button with Enter or Space at game over
        inert={!isVisible}
        // A long press would open the context menu
        onContextMenu={(event) => event.preventDefault()}
      >
        <div className="control-buttons">
          <DPad className={controllerStyleLayout ? "left" : "right"} />
          <div
            className={
              controllerStyleLayout
                ? "action-buttons right"
                : "action-buttons left"
            }
          >
            <MappedButton
              className="touch-btn ccw-btn"
              code="KeyZ"
              ref={rotateLeftBtnRef}
            >
              <span className="touch-btn-front large">
                <Icon
                  className="touch-btn-icon"
                  path={mdiRotateLeftVariant}
                  size={1}
                />
              </span>
            </MappedButton>
            <MappedButton
              className="touch-btn cw-btn"
              code="KeyX"
              ref={rotateRightBtnRef}
            >
              <span className="touch-btn-front large">
                <Icon
                  className="touch-btn-icon"
                  path={mdiRotateRightVariant}
                  size={1}
                />
              </span>
            </MappedButton>
            <MappedButton
              className="touch-btn drop-btn"
              code="Space"
              ref={hardDropBtnRef}
            >
              <span className="touch-btn-front large">
                {/* Space confirms in menus and hard drops in game */}
                <Icon
                  className="touch-btn-icon"
                  path={menu ? mdiCheckBold : mdiArrowCollapseDown}
                  size={1}
                />
              </span>
            </MappedButton>
          </div>
        </div>
        <div className="system-buttons">
          <button className="touch-btn system" onClick={toggleLayout}>
            <span className="touch-btn-front system">
              <Icon
                className="touch-btn-icon"
                path={mdiSwapHorizontal}
                horizontal={controllerStyleLayout ? true : false}
                size={1}
              />
            </span>
          </button>
          <button className="touch-btn system" onClick={toggleIsVisible}>
            <span className="touch-btn-front system">
              <Icon
                className="touch-btn-icon"
                path={mdiDesktopTowerMonitor}
                size={1}
              />
            </span>
          </button>
          <MappedButton
            className="touch-btn system"
            code="Enter"
            ref={pauseBtnRef}
          >
            <span className="touch-btn-front system">
              <Icon
                className="touch-btn-icon"
                path={mdiPauseCircleOutline}
                size={1}
              />
            </span>
          </MappedButton>
        </div>
      </div>
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

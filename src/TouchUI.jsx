import { useEffect, useRef, useState } from "react";
import { Icon } from "@mdi/react";
import {
  mdiGestureTapButton,
  mdiDesktopTowerMonitor,
  mdiSwapHorizontal,
  mdiPauseCircleOutline,
  mdiPlay,
  mdiCheckBold,
  mdiRotateLeftVariant,
  mdiRotateRightVariant,
} from "@mdi/js";
import { dispatchKeyDown, dispatchKeyUp } from "./utils";

export default function TouchUI({ menu }) {
  const [isVisible, setIsVisible] = useState(false);
  const [controllerStyleLayout, setControllerStyleLayout] = useState(true); // D-pad on the left

  // On-screen button references
  const pauseBtnRef = useRef(null);
  const rotateLeftBtnRef = useRef(null);
  const rotateRightBtnRef = useRef(null);
  const hardDropBtnRef = useRef(null);
  const arrowUpBtnRef = useRef(null);
  const arrowLeftBtnRef = useRef(null);
  const arrowDownBtnRef = useRef(null);
  const arrowRightBtnRef = useRef(null);

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
        case "ArrowUp":
          arrowUpBtnRef.current.classList.add("active");
          break;
        case "ArrowLeft":
          arrowLeftBtnRef.current.classList.add("active");
          break;
        case "ArrowDown":
          arrowDownBtnRef.current.classList.add("active");
          break;
        case "ArrowRight":
          arrowRightBtnRef.current.classList.add("active");
          break;
        case "Space":
          hardDropBtnRef.current.classList.add("active");
          break;
        case "Enter":
          // Only when Enter pauses or resumes the game, not for menu selections
          if (menu === null || menu === "pause") {
            pauseBtnRef.current.classList.add("active");
          }
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
        case "ArrowUp":
          arrowUpBtnRef.current.classList.remove("active");
          break;
        case "ArrowLeft":
          arrowLeftBtnRef.current.classList.remove("active");
          break;
        case "ArrowDown":
          arrowDownBtnRef.current.classList.remove("active");
          break;
        case "ArrowRight":
          arrowRightBtnRef.current.classList.remove("active");
          break;
        case "Space":
          hardDropBtnRef.current.classList.remove("active");
          break;
        case "Enter":
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
  }, [menu]);

  return (
    <>
      {isVisible || (
        <button className="icon-btn show-touch-ui-btn" onClick={toggleIsVisible}>
          <Icon path={mdiGestureTapButton} size={1} />
        </button>
      )}
      <div className={isVisible ? "touch-ui visible" : "touch-ui"}>
        <div className="control-buttons">
          <div
            className={
              controllerStyleLayout ? "arrow-buttons left" : "arrow-buttons right"
            }
          >
            <MappedButton
              className="touch-btn up-arrow"
              code="ArrowUp"
              ref={arrowUpBtnRef}
            >
              <span className="touch-btn-front large">
                <Icon
                  className="touch-btn-icon"
                  path={mdiPlay}
                  rotate={270}
                  size={1}
                />
              </span>
            </MappedButton>
            <MappedButton
              className="touch-btn left-arrow"
              code="ArrowLeft"
              ref={arrowLeftBtnRef}
            >
              <span className="touch-btn-front large">
                <Icon
                  className="touch-btn-icon"
                  path={mdiPlay}
                  rotate={180}
                  size={1}
                />
              </span>
            </MappedButton>
            <MappedButton
              className="touch-btn right-arrow"
              code="ArrowRight"
              ref={arrowRightBtnRef}
            >
              <span className="touch-btn-front large">
                <Icon className="touch-btn-icon" path={mdiPlay} size={1} />
              </span>
            </MappedButton>
            <MappedButton
              className="touch-btn down-arrow"
              code="ArrowDown"
              ref={arrowDownBtnRef}
            >
              <span className="touch-btn-front large">
                <Icon
                  className="touch-btn-icon"
                  path={mdiPlay}
                  rotate={90}
                  size={1}
                />
              </span>
            </MappedButton>
          </div>
          <div
            className={
              controllerStyleLayout ? "action-buttons right" : "action-buttons left"
            }
          >
            <MappedButton
              className="touch-btn ccw-btn"
              code="KeyZ"
              ref={rotateLeftBtnRef}
            >
              <span className="touch-btn-front large">
                <Icon className="touch-btn-icon" path={mdiRotateLeftVariant} size={1} />
              </span>
            </MappedButton>
            <MappedButton
              className="touch-btn cw-btn"
              code="KeyX"
              ref={rotateRightBtnRef}
            >
              <span className="touch-btn-front large">
                <Icon className="touch-btn-icon" path={mdiRotateRightVariant} size={1} />
              </span>
            </MappedButton>
            <MappedButton
              className="touch-btn drop-btn"
              code="Space"
              ref={hardDropBtnRef}
            >
              <span className="touch-btn-front large">
                <Icon
                  className="touch-btn-icon"
                  path={mdiCheckBold}
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

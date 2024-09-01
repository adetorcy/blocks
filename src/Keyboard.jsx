import { forwardRef, useEffect, useRef, useState } from "react";
import Icon from "@mdi/react";
import {
  mdiKeyboardOutline,
  mdiKeyboardCloseOutline,
  mdiSwapHorizontal,
  mdiPauseOctagonOutline,
  mdiPlay,
  mdiKeyboardSpace,
  mdiAlphaZ,
  mdiAlphaX,
} from "@mdi/js";
import { dispatchKeyDown, dispatchKeyUp } from "./utils";

export default function Keyboard() {
  const [isOpen, setIsOpen] = useState(false);
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

  function toggleKeyboard() {
    setIsOpen((x) => !x);
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
        case "Escape":
          pauseBtnRef.current.classList.add("active");
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
        case "Escape":
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

  return (
    <>
      {isOpen || (
        <button className="icon-btn open-keyboard-btn" onClick={toggleKeyboard}>
          <Icon path={mdiKeyboardOutline} size={1} />
        </button>
      )}
      <div className={isOpen ? "keyboard open" : "keyboard"}>
        <div className="control-keys">
          <div
            className={
              controllerStyleLayout ? "arrow-keys left" : "arrow-keys right"
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
              controllerStyleLayout ? "action-keys right" : "action-keys left"
            }
          >
            <MappedButton
              className="touch-btn ccw-key"
              code="KeyZ"
              ref={rotateLeftBtnRef}
            >
              <span className="touch-btn-front large">
                <Icon className="touch-btn-icon" path={mdiAlphaZ} size={1} />
              </span>
            </MappedButton>
            <MappedButton
              className="touch-btn cw-key"
              code="KeyX"
              ref={rotateRightBtnRef}
            >
              <span className="touch-btn-front large">
                <Icon className="touch-btn-icon" path={mdiAlphaX} size={1} />
              </span>
            </MappedButton>
            <MappedButton
              className="touch-btn drop-key"
              code="Space"
              ref={hardDropBtnRef}
            >
              <span className="touch-btn-front large">
                <Icon
                  className="touch-btn-icon"
                  path={mdiKeyboardSpace}
                  size={1}
                />
              </span>
            </MappedButton>
          </div>
        </div>
        <div className="system-keys">
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
          <button className="touch-btn system" onClick={toggleKeyboard}>
            <span className="touch-btn-front system">
              <Icon
                className="touch-btn-icon"
                path={mdiKeyboardCloseOutline}
                size={1}
              />
            </span>
          </button>
          <MappedButton
            className="touch-btn system"
            code="Escape"
            ref={pauseBtnRef}
          >
            <span className="touch-btn-front system">
              <Icon
                className="touch-btn-icon"
                path={mdiPauseOctagonOutline}
                size={1}
              />
            </span>
          </MappedButton>
        </div>
      </div>
    </>
  );
}

const MappedButton = forwardRef(function MappedButton(
  { className, code, children },
  ref
) {
  return (
    <button
      {...{ className, ref }}
      onMouseDown={() => dispatchKeyDown({ code })}
      onMouseUp={() => dispatchKeyUp({ code })}
      onTouchStart={() => dispatchKeyDown({ code })}
      onTouchEnd={() => dispatchKeyUp({ code })}
    >
      {children}
    </button>
  );
});

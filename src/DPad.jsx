import { useEffect, useRef, useState } from "react";
import { dispatchKeyDown, dispatchKeyUp } from "./utils";

// Arrow key for each direction and back
const KEYS = {
  up: "ArrowUp",
  down: "ArrowDown",
  left: "ArrowLeft",
  right: "ArrowRight",
};
const DIRECTIONS = Object.fromEntries(
  Object.entries(KEYS).map(([direction, code]) => [code, direction]),
);

// Radius of the middle where no arrow is pressed
const DEAD_ZONE = 10;

// Cross outline, in a 132 box
const CROSS =
  "M45 9a8 8 0 0 1 8-8h26a8 8 0 0 1 8 8v36h36a8 8 0 0 1 8 8v26a8 8 0 0 1-8 8h-36v36a8 8 0 0 1-8 8h-26a8 8 0 0 1-8-8v-36h-36a8 8 0 0 1-8-8v-26a8 8 0 0 1 8-8h36z";

// Each arm from its tip to the middle square, filled when pressed
const ARMS = {
  up: "M45 45V9a8 8 0 0 1 8-8h26a8 8 0 0 1 8 8v36z",
  down: "M45 87v36a8 8 0 0 0 8 8h26a8 8 0 0 0 8-8V87z",
  left: "M45 45H9a8 8 0 0 0-8 8v26a8 8 0 0 0 8 8h36z",
  right: "M87 45h36a8 8 0 0 1 8 8v26a8 8 0 0 1-8 8H87z",
};

// One-piece D-pad
// The whole square is the touch area, split by angle around the center
// So there's no gap between arrows and the thumb can slide from one to the next
// Sliding releases the old arrow key and presses the new one
// The pointer is captured so the thumb can drift off the square
export default function DPad() {
  // Direction shown pressed, from touch or a physical arrow key
  const [direction, setDirection] = useState(null);

  // Touch in progress and the arrow it holds
  const pointerRef = useRef(null);
  const touchDirectionRef = useRef(null);

  function press(next) {
    const current = touchDirectionRef.current;
    if (next === current) return;

    if (current) dispatchKeyUp({ code: KEYS[current] });
    if (next) dispatchKeyDown({ code: KEYS[next] });
    touchDirectionRef.current = next;
    setDirection(next);
  }

  function read(event) {
    const box = event.currentTarget.getBoundingClientRect();
    const dx = event.clientX - (box.left + box.width / 2);
    const dy = event.clientY - (box.top + box.height / 2);

    if (Math.hypot(dx, dy) < DEAD_ZONE) {
      press(null);
    } else if (Math.abs(dx) > Math.abs(dy)) {
      press(dx < 0 ? "left" : "right");
    } else {
      press(dy < 0 ? "up" : "down");
    }
  }

  function handlePointerDown(event) {
    // One thumb at a time
    if (pointerRef.current !== null) return;

    event.preventDefault();
    pointerRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    read(event);
  }

  function handlePointerMove(event) {
    if (event.pointerId === pointerRef.current) read(event);
  }

  function handlePointerEnd(event) {
    if (event.pointerId !== pointerRef.current) return;

    pointerRef.current = null;
    press(null);
  }

  // Highlight for physical arrow keys
  useEffect(() => {
    function handleKeydown(event) {
      const pressed = DIRECTIONS[event.code];
      if (pressed) setDirection(pressed);
    }

    function handleKeyup(event) {
      const released = DIRECTIONS[event.code];
      if (released) setDirection((x) => (x === released ? null : x));
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
    <div
      className="dpad"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onLostPointerCapture={handlePointerEnd}
    >
      {/* Arms first so a filled arm never covers the outline */}
      <svg className="dpad-cross" viewBox="0 0 132 132" aria-hidden="true">
        {direction && <path className="dpad-arm" d={ARMS[direction]} />}
        <path className="dpad-rim" d={CROSS} />
        {[0, 90, 180, 270].map((angle) => (
          <path
            key={angle}
            className="dpad-arrow"
            transform={`rotate(${angle} 66 66)`}
            d="M66 14 58.5 24.5h15z"
          />
        ))}
      </svg>
    </div>
  );
}

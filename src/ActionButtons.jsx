import { useEffect, useRef, useState } from "react";
import { dispatchKeyDown, dispatchKeyUp } from "./utils";

// A hard drops (and confirms in menus), B rotates left
// Centers in a 132 box, on a 45° line with B low on the left like a Game Boy
const BUTTONS = [
  { name: "B", code: "KeyZ", x: 36, y: 96 },
  { name: "A", code: "Space", x: 96, y: 36 },
];

const SIZE = 70;

// Touch area past each button's rim
const REACH = 18;

// Physical keys for the highlight
const NAMES = Object.fromEntries(BUTTONS.map(({ name, code }) => [code, name]));

// A and B buttons
// One touch area for the group, reaching a little past the buttons
// A touch goes to the nearest button center, if it's within reach
// The button is picked when the finger lands and kept until it lifts
// Each finger is tracked on its own, a button held by two fingers is one key press
export default function ActionButtons() {
  // Buttons shown pressed, from touch or physical keys
  const [pressed, setPressed] = useState({});

  // Button held by each finger
  const pointersRef = useRef(new Map());
  const boxRef = useRef(null);

  function show(name, down) {
    setPressed((x) => ({ ...x, [name]: down }));
  }

  // Number of fingers on a button
  function fingers(button) {
    return [...pointersRef.current.values()].filter((x) => x === button).length;
  }

  function nearest(event) {
    const box = boxRef.current.getBoundingClientRect();
    let closest = null;
    let closestDistance = SIZE / 2 + REACH;
    for (const button of BUTTONS) {
      const distance = Math.hypot(
        event.clientX - (box.left + button.x),
        event.clientY - (box.top + button.y),
      );
      if (distance <= closestDistance) {
        closest = button;
        closestDistance = distance;
      }
    }
    return closest;
  }

  function handlePointerDown(event) {
    const button = nearest(event);
    // Out of reach of every button
    if (!button) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    if (fingers(button) === 0) dispatchKeyDown({ code: button.code });
    pointersRef.current.set(event.pointerId, button);
    show(button.name, true);
  }

  function handlePointerEnd(event) {
    const button = pointersRef.current.get(event.pointerId);
    if (!button) return;

    pointersRef.current.delete(event.pointerId);
    if (fingers(button) > 0) return;
    dispatchKeyUp({ code: button.code });
    show(button.name, false);
  }

  // Highlight for physical keys
  useEffect(() => {
    function handleKeydown(event) {
      const name = NAMES[event.code];
      if (name) setPressed((x) => ({ ...x, [name]: true }));
    }

    function handleKeyup(event) {
      const name = NAMES[event.code];
      if (name) setPressed((x) => ({ ...x, [name]: false }));
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
      className="action-buttons"
      // Touch area past the box, without taking room in the layout
      style={{ padding: REACH, margin: -REACH }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onLostPointerCapture={handlePointerEnd}
    >
      <div ref={boxRef} className="action-buttons-box">
        {BUTTONS.map(({ name, x, y }) => (
          <div
            key={name}
            className="action-button"
            data-pressed={pressed[name] || undefined}
            style={{ left: x, top: y, width: SIZE, height: SIZE }}
          >
            {name}
          </div>
        ))}
      </div>
    </div>
  );
}

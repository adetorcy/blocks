import { useEffect, useState } from "react";
import { autoFocusRef } from "./utils";

export default function StartMenu({
  startButtonCallback,
  controlsButtonCallback,
}) {
  const [focusedButtonIndex, setFocusedButtonIndex] = useState(0);

  useEffect(() => {
    // Callback for keydown event listener
    function handleKeydown(event) {
      if (["ArrowUp", "ArrowDown"].includes(event.key)) {
        setFocusedButtonIndex((index) => (index + 1) % 2);
      }
    }

    // Add event listener
    window.addEventListener("keydown", handleKeydown);

    return () => {
      // Remove event listener
      window.removeEventListener("keydown", handleKeydown);
    };
  }, []);

  // Array of callback-label pairs
  const buttons = [
    [startButtonCallback, "START"],
    [controlsButtonCallback, "CONTROLS"],
  ];

  return (
    <div className="card stack startmenu">
      {buttons.map(([callback, label], i) => (
        <button
          key={i}
          onClick={callback}
          ref={i === focusedButtonIndex ? autoFocusRef : null}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

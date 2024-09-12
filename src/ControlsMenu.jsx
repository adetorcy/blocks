import { useEffect, useRef } from "react";
import { listenForKeydown, cleanupForKeydown } from "./utils";

export default function ControlsMenu({ showStartMenu }) {
  const selectedRef = useRef(null);

  useEffect(() => {
    // Callback for keydown event listener
    function handleKeydown(event) {
      switch (event.code) {
        case "Enter":
        case "Space":
          selectedRef.current.click();
          event.preventDefault();
          break;
      }
    }

    // Add event listeners
    listenForKeydown(handleKeydown);

    return () => {
      // Remove event listeners
      cleanupForKeydown(handleKeydown);
    };
  }, [showStartMenu]);

  return (
    <div className="stack menu">
      <div className="stack controls-list">
        {controls.map(([keyName, action], i) => (
          <div key={i} className="controls-list-item">
            <span>{keyName}:</span>
            <span>{action}</span>
          </div>
        ))}
      </div>
      <div
        ref={selectedRef}
        className="menu-option selected"
        onClick={showStartMenu}
      >
        OK
      </div>
    </div>
  );
}

const controls = [
  ["LEFT, RIGHT", "MOVE"],
  ["UP", "ROTATE RIGHT"],
  ["DOWN", "SOFT DROP"],
  ["SPACE", "HARD DROP"],
  ["Z", "ROTATE LEFT"],
  ["X", "ROTATE RIGHT"],
  ["ESC", "PAUSE GAME"],
];

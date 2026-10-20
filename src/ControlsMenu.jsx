import { useEffect } from "react";
import { listenForKeydown } from "./utils";

export default function ControlsMenu({ showStartMenu }) {
  useEffect(() => {
    // Callback for keydown event listener
    function handleKeydown(event) {
      switch (event.code) {
        case "Enter":
        case "Space":
        case "KeyZ":
          // OK, or B goes back, both to the start menu
          // Ignore auto-repeat from a held key
          if (!event.repeat) showStartMenu();
          event.preventDefault();
          break;
      }
    }

    return listenForKeydown(handleKeydown);
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
      <div className="menu-option selected" onClick={showStartMenu}>
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
  ["ENTER", "PAUSE GAME"],
];

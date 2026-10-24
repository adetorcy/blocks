import { useEffect } from "react";
import { listenForMenuInput } from "./input";

export default function ControlsMenu({ showStartMenu }) {
  useEffect(() => {
    function handleMenuInput(name, repeat) {
      // OK, or back, both to the start menu
      // Ignore auto-repeat from a held key
      if ((name === "confirm" || name === "back") && !repeat) showStartMenu();
    }

    return listenForMenuInput(handleMenuInput);
  }, [showStartMenu]);

  return (
    <div className="stack menu menu-controls">
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

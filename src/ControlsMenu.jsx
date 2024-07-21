import { autoFocusRef } from "./utils";

export default function ControlsMenu({ showStartMenu }) {
  return (
    <div className="stack menu toplayer">
      <div className="stack">
        {controls.map(([keyName, action], i) => (
          <div key={i} className="controlsline">
            <span>{keyName}:</span>
            <span>{action}</span>
          </div>
        ))}
      </div>
      <button ref={autoFocusRef} onClick={showStartMenu}>
        OK
      </button>
    </div>
  );
}

const controls = [
  ["LEFT/RIGHT", "MOVE"],
  ["UP", "ROTATE CW"],
  ["DOWN", "SOFT DROP"],
  ["SPACE", "HARD DROP"],
  ["Z", "ROTATE CCW"],
  ["X", "ROTATE CW"],
  ["ESC", "PAUSE GAME"],
];

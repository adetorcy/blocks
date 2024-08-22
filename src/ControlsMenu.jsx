import { autoFocusRef } from "./utils";

export default function ControlsMenu({ showStartMenu }) {
  return (
    <div className="stack menu">
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
  ["UP", "ROTATE RIGHT"],
  ["DOWN", "SOFT DROP"],
  ["SPACE", "HARD DROP"],
  ["Z", "ROTATE LEFT"],
  ["X", "ROTATE RIGHT"],
  ["ESC", "PAUSE GAME"],
];

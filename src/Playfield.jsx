import { useState } from "react";

export default function Playfield() {
  const [content, setContent] = useState(null);

  switch (content) {
    // Show controls menu
    case "controls":
      return (
        <div className="playfield playfield-menu">
          <div className="controls">
            {controls.map(([keyName, action], i) => (
              <div key={i} className="controlsline">
                <span>{keyName}:</span>
                <span>{action}</span>
              </div>
            ))}
          </div>
          <button className="btn ok-btn blink" onClick={() => setContent(null)}>
            OK
          </button>
        </div>
      );
    case "game":
    default:
      // Show start menu
      return (
        <div className="playfield playfield-menu startmenu">
          <button className="btn">START</button>
          <button className="btn" onClick={() => setContent("controls")}>
            CONTROLS
          </button>
        </div>
      );
  }
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

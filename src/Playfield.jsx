import { useState } from "react";
import StartMenu from "./StartMenu";
import Game from "./game";
import { autoFocusRef } from "./utils";

export default function Playfield() {
  const [content, setContent] = useState(null);

  switch (content) {
    case "controls":
      // Controls menu
      return (
        <div className="card stack controls">
          <div className="stack">
            {controls.map(([keyName, action], i) => (
              <div key={i} className="controlsline">
                <span>{keyName}:</span>
                <span>{action}</span>
              </div>
            ))}
          </div>
          <button ref={autoFocusRef} onClick={() => setContent(null)}>
            OK
          </button>
        </div>
      );

    case "game":
      return <Game escButtonCallback={() => setContent(null)} />;

    default:
      return (
        <StartMenu
          startButtonCallback={() => setContent("game")}
          controlsButtonCallback={() => setContent("controls")}
        />
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

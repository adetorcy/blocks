import { useEffect } from "react";
import { listenForMenuInput } from "./input";
import { version } from "../package.json";
import { centeredLeft } from "./text";

// What the game is, then a privacy notice
// The 2P sentence comes first so "game" isn't repeated back to back
const PARAGRAPHS = [
  ["UNOFFICIAL REMAKE OF A", "WELL-KNOWN PUZZLE GAME"],
  ["2P SHARES YOUR IP ADDRESS", "WITH THE OTHER PLAYER"],
  ["THE GAME DOES NOT COLLECT", "ANY PERSONAL DATA"],
];

export default function AboutMenu({ showStartMenu }) {
  useEffect(() => {
    function handleMenuInput(name, repeat) {
      // OK, or back, both to the start menu
      // Ignore auto-repeat from a held key
      if ((name === "confirm" || name === "back") && !repeat) showStartMenu();
    }

    return listenForMenuInput(handleMenuInput);
  }, [showStartMenu]);

  return (
    <div className="stack menu menu-about">
      <div>BLOCKS v{version}</div>
      {PARAGRAPHS.map((lines) => (
        <div key={lines[0]} className="stack about-text">
          {lines.map((line) => (
            <div key={line} style={{ marginLeft: centeredLeft(line) }}>
              {line}
            </div>
          ))}
        </div>
      ))}
      <div className="menu-option selected" onClick={showStartMenu}>
        OK
      </div>
    </div>
  );
}

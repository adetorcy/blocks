import { useEffect } from "react";
import { listenForKeydown } from "./utils";

export default function GameOverMenu({ quit }) {
  useEffect(() => {
    // Callback for keydown event listener
    function handleKeydown(event) {
      switch (event.code) {
        case "Enter":
        case "Space":
          // Ignore auto-repeat from a held key
          if (!event.repeat) quit();
          event.preventDefault();
          break;
      }
    }

    return listenForKeydown(handleKeydown);
  }, [quit]);

  return (
    <div className="menu menu-frame menu-game-over">
      <div className="stack card menu-box">
        <div className="menu-title">GAME OVER</div>
        <div className="menu-option selected" onClick={quit}>
          OK
        </div>
      </div>
    </div>
  );
}

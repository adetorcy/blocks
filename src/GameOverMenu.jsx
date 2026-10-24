import { useEffect } from "react";
import { listenForMenuInput } from "./input";

export default function GameOverMenu({ quit }) {
  useEffect(() => {
    function handleMenuInput(name, repeat) {
      // Ignore auto-repeat from a held key
      if (name === "confirm" && !repeat) quit();
    }

    return listenForMenuInput(handleMenuInput);
  }, [quit]);

  return (
    <div className="stack menu menu-box menu-game-over">
      <div className="menu-title">GAME OVER</div>
      <div className="menu-option selected" onClick={quit}>
        OK
      </div>
    </div>
  );
}

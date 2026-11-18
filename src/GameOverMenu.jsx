import { useEffect, useState } from "react";
import { listenForMenuInput } from "./input";
import { OK_DELAY } from "./constants";

// Wait a bit before showing OK and calling quit()
// So we don't accidentally hit OK before we've
// had the chance to see our final score
export default function GameOverMenu({ quit }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timeoutID = setTimeout(() => setReady(true), OK_DELAY);
    return () => clearTimeout(timeoutID);
  }, []);

  useEffect(() => {
    if (!ready) return;

    function handleMenuInput(name, repeat) {
      // Ignore auto-repeat from a held key
      if (name === "confirm" && !repeat) quit();
    }

    return listenForMenuInput(handleMenuInput);
  }, [quit, ready]);

  return (
    <div className="stack menu menu-box menu-game-over">
      <div className="menu-title">GAME OVER</div>
      <div
        className={`menu-option selected${ready ? "" : " disabled"}`}
        onClick={ready ? quit : undefined}
      >
        OK
      </div>
    </div>
  );
}

import { useEffect } from "react";
import { listenForMenuInput } from "./input";
import SetupTitle from "./SetupTitle";

// Opened a link, connecting to the player who sent it
// CANCEL and back leave the room
export default function JoiningMenu({ cancel }) {
  useEffect(() => {
    function handleMenuInput(name, repeat) {
      // Ignore auto-repeat from a held key
      if ((name === "confirm" || name === "back") && !repeat) cancel();
    }

    return listenForMenuInput(handleMenuInput);
  }, [cancel]);

  return (
    <div className="stack menu menu-joining">
      <SetupTitle side="join" />
      <div className="joining">JOINING...</div>
      <div className="menu-option selected" onClick={cancel}>
        CANCEL
      </div>
    </div>
  );
}

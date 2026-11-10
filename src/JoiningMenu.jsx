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
    <div className="stack menu menu-setup menu-joining">
      <SetupTitle />
      <div className="setup-status">JOINING...</div>
      <div className="stack setup-options">
        <div className="menu-option cancel selected" onClick={cancel}>
          CANCEL
        </div>
      </div>
    </div>
  );
}

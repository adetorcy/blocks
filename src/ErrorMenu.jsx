import { useEffect } from "react";
import { listenForMenuInput } from "./input";

// What went wrong for each transport error, one terse line
const MESSAGES = {
  failed: "CAN'T CONNECT",
};

// 2P setup error under the screen's title, OK goes home
export default function ErrorMenu({ title, reason, ok }) {
  useEffect(() => {
    function handleMenuInput(name, repeat) {
      // OK, or back, both home
      // Ignore auto-repeat from a held key
      if ((name === "confirm" || name === "back") && !repeat) ok();
    }

    return listenForMenuInput(handleMenuInput);
  }, [ok]);

  return (
    <div className="stack menu menu-error">
      <div className="setup-title">{title}</div>
      <div className={`error-${reason}`}>{MESSAGES[reason]}</div>
      <div className="menu-option selected" onClick={ok}>
        OK
      </div>
    </div>
  );
}

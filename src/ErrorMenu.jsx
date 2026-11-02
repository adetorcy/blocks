import { useEffect } from "react";
import { listenForMenuInput } from "./input";
import SetupTitle from "./SetupTitle";

// What went wrong for each setup error, one terse line
// link is ours (a link we can't read), the rest come from the transport
// Only failed reaches the creator
const MESSAGES = {
  link: "INVALID LINK",
  password: "INVALID LINK",
  timeout: "GAME NOT FOUND",
  full: "GAME FULL",
  version: "VERSION MISMATCH",
  failed: "CAN'T CONNECT",
};

// 2P setup error under the screen's title, OK goes home
export default function ErrorMenu({ side, reason, ok }) {
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
      <SetupTitle side={side} />
      <div className={`error-${reason}`}>{MESSAGES[reason]}</div>
      <div className="menu-option selected" onClick={ok}>
        OK
      </div>
    </div>
  );
}

import { useEffect } from "react";
import { listenForMenuInput } from "./input";
import { centeredLeft } from "./text";
import SetupTitle from "./SetupTitle";

// What went wrong for each setup error, one terse line
// link: a link we can't read
// lost: our page was frozen too long (a hidden page on a phone)
// The rest are join errors from the transport, only failed reaches the creator
// left (SAM LEFT) is built below
const MESSAGES = {
  link: "INVALID LINK",
  password: "INVALID LINK",
  timeout: "GAME NOT FOUND",
  full: "GAME FULL",
  version: "VERSION MISMATCH",
  failed: "CAN'T CONNECT",
  lost: "CONNECTION LOST",
};

// 2P setup error under the screen's title, OK goes home
// left: the other player left before the game, SAM LEFT centered at runtime
export default function ErrorMenu({ reason, name, ok }) {
  const text = reason === "left" ? `${name} LEFT` : MESSAGES[reason];

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
      <SetupTitle />
      <div
        className={`error-${reason}`}
        style={reason === "left" ? { marginLeft: centeredLeft(text) } : null}
      >
        {text}
      </div>
      <div className="menu-option selected" onClick={ok}>
        OK
      </div>
    </div>
  );
}

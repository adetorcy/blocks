import { useEffect, useState } from "react";
import { listenForMenuInput } from "./input";
import { centeredLeft } from "./text";
import SetupTitle from "./SetupTitle";
import CancelWindow from "./CancelWindow";

// Both players connected, on both sides
// The other player's name, centered when it's known
// CANCEL and back always ask first, the other player is right there
export default function VsMenu({ name, cancel }) {
  const [confirming, setConfirming] = useState(false);
  const vs = `VS ${name}`;

  useEffect(() => {
    if (confirming) return;

    function handleMenuInput(input, repeat) {
      // Ignore auto-repeat from a held key
      if ((input === "confirm" || input === "back") && !repeat) {
        setConfirming(true);
      }
    }

    return listenForMenuInput(handleMenuInput);
  }, [confirming]);

  return (
    <>
      <div className="stack menu menu-vs">
        <SetupTitle />
        <div style={{ marginLeft: centeredLeft(vs) }}>{vs}</div>
        <div
          className={confirming ? "menu-option" : "menu-option selected"}
          onClick={() => setConfirming(true)}
        >
          CANCEL
        </div>
      </div>
      {confirming && (
        <CancelWindow
          className="over-vs"
          no={() => setConfirming(false)}
          yes={cancel}
        />
      )}
    </>
  );
}

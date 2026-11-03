import { useEffect, useState } from "react";
import { listenForMenuInput } from "./input";
import { centeredLeft } from "./text";
import SetupTitle from "./SetupTitle";
import CancelWindow from "./CancelWindow";

// Both players connected, on both sides
// The other player's name, centered when it's known
// START GAME first, the countdown starts once both have pressed it
// Once pressed WAITING FOR and their name in gray take its place
// CANCEL and back always ask first, the other player is right there
export default function VsMenu({ name, ready, cancel }) {
  const [waiting, setWaiting] = useState(false);
  const [selected, setSelected] = useState("start");
  const [confirming, setConfirming] = useState(false);
  const vs = `VS ${name}`;
  const waitingFor = `WAITING FOR ${name}`;

  // Only CANCEL left to select
  function startGame() {
    setWaiting(true);
    setSelected("cancel");
    ready();
  }

  useEffect(() => {
    if (confirming) return;

    function handleMenuInput(input, repeat) {
      if ((input === "up" || input === "down") && !waiting) {
        setSelected((option) => (option === "start" ? "cancel" : "start"));
      }
      // Ignore auto-repeat from a held key
      if (repeat) return;
      if (input === "confirm" && selected === "start") startGame();
      else if (input === "confirm" || input === "back") setConfirming(true);
    }

    return listenForMenuInput(handleMenuInput);
  });

  const className = (option) =>
    `menu-option ${option}${selected === option && !confirming ? " selected" : ""}`;

  return (
    <>
      <div className="stack menu menu-vs">
        <SetupTitle />
        <div style={{ marginLeft: centeredLeft(vs) }}>{vs}</div>
        {waiting ? (
          <div
            className="waiting-for"
            style={{ marginLeft: centeredLeft(waitingFor) }}
          >
            {waitingFor}
          </div>
        ) : (
          <div className={className("start")} onClick={startGame}>
            START GAME
          </div>
        )}
        <div
          className={className("cancel")}
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

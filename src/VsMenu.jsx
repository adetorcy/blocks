import { useEffect, useState } from "react";
import { listenForMenuInput } from "./input";
import { centeredLeft } from "./text";
import SetupTitle from "./SetupTitle";
import ConfirmWindow from "./ConfirmWindow";

// Both players connected, on both sides
// Our name on top, VS, then theirs, each line centered on its ink
// START GAME first, the countdown starts once both have pressed it
// Once pressed, START GAME goes away and WAITING FOR SAM shows in gray
// CANCEL and back always ask first, the other player is right there
export default function VsMenu({ ownName, opponentName, ready, cancel }) {
  const [waiting, setWaiting] = useState(false);
  const [selected, setSelected] = useState("start");
  const [confirming, setConfirming] = useState(false);
  const waitingFor = `WAITING FOR ${opponentName}`;

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
    selected === option && !confirming ? "menu-option selected" : "menu-option";

  return (
    <>
      <div className="stack menu menu-setup menu-vs">
        <SetupTitle />
        {[ownName, "VS", opponentName].map((line, i) => (
          <div key={i} style={{ marginLeft: centeredLeft(line) }}>
            {line}
          </div>
        ))}
        {waiting && (
          <div
            className="setup-status"
            style={{ marginLeft: centeredLeft(waitingFor) }}
          >
            {waitingFor}
          </div>
        )}
        <div className="stack setup-options">
          {!waiting && (
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
      </div>
      {confirming && (
        <ConfirmWindow
          title="CANCEL?"
          className={`menu-cancel over-vs${waiting ? " ready" : ""}`}
          no={() => setConfirming(false)}
          yes={cancel}
        />
      )}
    </>
  );
}

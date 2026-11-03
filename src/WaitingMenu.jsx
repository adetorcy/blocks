import { useEffect, useRef, useState } from "react";
import { listenForMenuInput, listenForRelease } from "./input";
import SetupTitle from "./SetupTitle";
import CancelWindow from "./CancelWindow";

// Share sheet on phones, COPY LINK everywhere
const canShare = typeof navigator.share === "function";

// 2P creator waiting for the opponent to open the link
// Sharing and copying need a user action (browser rule)
// Keys and taps count, a touch button only counts on release
// So A and START act on release here, on the option selected at press
export default function WaitingMenu({ link, cancel }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedRef = useRef(null);
  const [copied, setCopied] = useState(false);
  // Once the link is out, CANCEL asks first (it stops working)
  const [sent, setSent] = useState(false);
  const [confirming, setConfirming] = useState(false);
  // A or START pressed, acts when it's released
  const armedRef = useRef(false);

  function share() {
    navigator.share({ url: link }).then(
      () => setSent(true),
      // Share sheet closed without sending
      () => {},
    );
  }

  function copy() {
    navigator.clipboard?.writeText(link).then(
      () => {
        setCopied(true);
        setSent(true);
      },
      // Not allowed, COPY LINK stays
      () => {},
    );
  }

  function requestCancel() {
    if (sent) setConfirming(true);
    else cancel();
  }

  // Callback-label pairs, SHARE LINK only where there's a share sheet
  const options = [
    ...(canShare ? [[share, "SHARE LINK", "share"]] : []),
    [copy, copied ? "LINK COPIED" : "COPY LINK", copied ? "copied" : "copy"],
    [requestCancel, "CANCEL", "cancel"],
  ];
  const count = options.length;

  useEffect(() => {
    if (confirming) return;

    function handleMenuInput(name, repeat, touch) {
      if (name === "up") setSelectedIndex((i) => (i - 1 + count) % count);
      if (name === "down") setSelectedIndex((i) => (i + 1) % count);
      // Ignore auto-repeat from a held key
      if (repeat) return;
      if (name === "confirm") {
        if (touch) armedRef.current = true;
        else selectedRef.current.click();
      }
      if (name === "back") requestCancel();
    }

    function handleButtonRelease(button) {
      if (!armedRef.current || (button !== "A" && button !== "START")) return;
      armedRef.current = false;
      selectedRef.current.click();
    }

    const stopPress = listenForMenuInput(handleMenuInput);
    const stopRelease = listenForRelease(() => {}, handleButtonRelease);
    return () => {
      stopPress();
      stopRelease();
    };
  });

  return (
    <>
      <div className="stack menu menu-waiting">
        <SetupTitle />
        <div>SEND THE LINK</div>
        <div>TO PLAYER 2</div>
        <div className="waiting">WAITING...</div>
        {options.map(([callback, label, className], i) => {
          const selected = i === selectedIndex && !confirming;
          return (
            <div
              key={className}
              ref={i === selectedIndex ? selectedRef : null}
              className={`menu-option ${className}${selected ? " selected" : ""}`}
              onClick={callback}
            >
              {label}
            </div>
          );
        })}
      </div>
      {confirming && (
        <CancelWindow
          className="over-waiting"
          no={() => setConfirming(false)}
          yes={cancel}
        />
      )}
    </>
  );
}

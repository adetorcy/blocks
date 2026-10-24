import { useEffect, useRef, useState } from "react";
import { listenForMenuInput } from "./input";

export default function PauseMenu({ resume, quit }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedRef = useRef(null);

  useEffect(() => {
    function handleMenuInput(name, repeat) {
      if (name === "up" || name === "down") {
        setSelectedIndex((index) => (index + 1) % 2);
      }
      // Ignore auto-repeat from a held key
      if (repeat) return;
      if (name === "confirm") selectedRef.current.click();
      // Back to the game
      if (name === "back") resume();
    }

    return listenForMenuInput(handleMenuInput);
  }, [resume]);

  // Array of callback-label pairs
  const options = [
    [resume, "CONTINUE"],
    [quit, "QUIT"],
  ];

  return (
    <div className="stack menu menu-box menu-pause">
      <div className="menu-title">PAUSE</div>
      {options.map(([callback, label], i) => {
        const selected = i === selectedIndex;
        return (
          <div
            key={i}
            ref={selected ? selectedRef : null}
            className={selected ? "menu-option selected" : "menu-option"}
            onClick={callback}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
}

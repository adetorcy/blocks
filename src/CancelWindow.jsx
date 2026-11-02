import { useEffect, useRef, useState } from "react";
import { listenForMenuInput } from "./input";

// CANCEL? before throwing away a room the other player knows about
// The pause window, over the waiting or VS screen
// NO first and selected, so a double press keeps the room
// Back means NO
export default function CancelWindow({ className, no, yes }) {
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
      if (name === "back") no();
    }

    return listenForMenuInput(handleMenuInput);
  }, [no]);

  const options = [
    [no, "NO"],
    [yes, "YES"],
  ];

  return (
    <div className={`stack menu menu-box menu-cancel ${className}`}>
      <div className="menu-title">CANCEL?</div>
      {options.map(([callback, label], i) => {
        const selected = i === selectedIndex;
        return (
          <div
            key={label}
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

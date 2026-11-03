import { useEffect, useRef, useState } from "react";
import { listenForMenuInput } from "./input";

// 2P: asks to confirm before leaving the other player
// CANCEL? over the waiting and VS screens, QUIT? over the board in a game
// NO comes first and is selected, so a double press doesn't leave
// Back means NO
export default function ConfirmWindow({ title, className, no, yes }) {
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
    <div className={`stack menu menu-box menu-confirm ${className}`}>
      <div className="menu-title">{title}</div>
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

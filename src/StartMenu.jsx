import { useEffect, useRef, useState } from "react";
import { listenForKeydown } from "./utils";

export default function StartMenu({ showControlsMenu, start }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedRef = useRef(null);

  useEffect(() => {
    // Callback for keydown event listener
    function handleKeydown(event) {
      switch (event.code) {
        case "ArrowUp":
        case "ArrowDown":
          setSelectedIndex((index) => (index + 1) % 2);
          event.preventDefault();
          break;
        case "Enter":
        case "Space":
          // Ignore auto-repeat from a held key
          if (!event.repeat) selectedRef.current.click();
          event.preventDefault();
          break;
      }
    }

    return listenForKeydown(handleKeydown);
  }, []);

  // Array of callback-label pairs
  const options = [
    [start, "START"],
    [showControlsMenu, "CONTROLS"],
  ];

  return (
    <div className="stack menu menu-start">
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

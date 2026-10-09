import { useEffect, useRef, useState } from "react";
import { listenForKeydown, cleanupForKeydown } from "./utils";

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

    // Add event listeners
    listenForKeydown(handleKeydown);

    return () => {
      // Remove event listeners
      cleanupForKeydown(handleKeydown);
    };
  }, []);

  // Array of callback-label pairs
  const options = [
    [start, "START"],
    [showControlsMenu, "CONTROLS"],
  ];

  return (
    <div className="stack menu">
      {options.map(([callback, label], i) =>
        i === selectedIndex ? (
          <div
            ref={selectedRef}
            className="menu-option selected"
            key={i}
            onClick={callback}
          >
            {label}
          </div>
        ) : (
          <div className="menu-option" key={i} onClick={callback}>
            {label}
          </div>
        )
      )}
    </div>
  );
}

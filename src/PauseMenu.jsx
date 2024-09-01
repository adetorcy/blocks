import { useEffect, useRef, useState } from "react";
import { listenForKeydown, cleanupForKeydown } from "./utils";

export default function PauseMenu({ resume, quit }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedRef = useRef(null);

  useEffect(() => {
    // Callback for keydown event listener
    function handleKeydown(event) {
      switch (event.code) {
        case "Escape":
          resume();
          event.preventDefault();
          break;
        case "ArrowUp":
        case "ArrowDown":
          setSelectedIndex((index) => (index + 1) % 2);
          event.preventDefault();
          break;
        case "Enter":
        case "Space":
          selectedRef.current.click();
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
  }, [resume]);

  // Array of callback-label pairs
  const options = [
    [resume, "CONTINUE"],
    [quit, "QUIT"],
  ];

  return (
    <div className="stack menu menu-pause">
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

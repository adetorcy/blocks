import { useEffect, useRef } from "react";
import { listenForKeydown, cleanupForKeydown } from "./utils";

export default function GameOverMenu({ quit }) {
  const selectedRef = useRef(null);

  useEffect(() => {
    // Callback for keydown event listener
    function handleKeydown(event) {
      switch (event.code) {
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
  }, []);

  return (
    <div className="stack menu menu-pause">
      <div>GAME OVER</div>
      <div ref={selectedRef} className="menu-option selected" onClick={quit}>
        OK
      </div>
    </div>
  );
}

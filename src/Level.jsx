import { useEffect, useState } from "react";
import { padScore } from "./utils";
import { LEVEL_UPDATE } from "./events";
export default function Level() {
  const [level, setLevel] = useState(0);

  // Event listeners
  useEffect(() => {
    function handleLevelUpdate(event) {
      setLevel(event.detail);
    }

    // Add event listener
    window.addEventListener(LEVEL_UPDATE, handleLevelUpdate);

    return () => {
      // Remove event listener
      window.removeEventListener(LEVEL_UPDATE, handleLevelUpdate);
    };
  }, []);

  return (
    <div>
      <div>LEVEL</div>
      <div className="digits">{padScore(level)}</div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { padScore } from "./utils";
import { LEVEL_UPDATE_EVENT } from "./constants";

export default function Level() {
  const [level, setLevel] = useState(0);

  // Event listeners
  useEffect(() => {
    function handleLevelUpdate(event) {
      setLevel(event.detail);
    }

    // Add event listener
    window.addEventListener(LEVEL_UPDATE_EVENT, handleLevelUpdate);

    return () => {
      // Remove event listener
      window.removeEventListener(LEVEL_UPDATE_EVENT, handleLevelUpdate);
    };
  }, []);

  return (
    <div>
      <div>LEVEL</div>
      <div className="scorevalue">{padScore(level)}</div>
    </div>
  );
}

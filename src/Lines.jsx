import { useEffect, useState } from "react";
import { padScore } from "./utils";
import { LINES_UPDATE } from "./events";

export default function Lines() {
  const [lines, setLines] = useState(0);

  // Event listeners
  useEffect(() => {
    function handleLinesUpdate(event) {
      setLines(event.detail);
    }

    // Add event listener
    window.addEventListener(LINES_UPDATE, handleLinesUpdate);

    return () => {
      // Remove event listener
      window.removeEventListener(LINES_UPDATE, handleLinesUpdate);
    };
  }, []);

  return (
    <div>
      <div>LINES</div>
      <div className="digits">{padScore(lines)}</div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { padScore } from "./utils";
import { SCORE_UPDATE } from "./events";

export default function Score() {
  const [score, setScore] = useState(0);

  // Event listeners
  useEffect(() => {
    function handleScoreUpdate(event) {
      setScore(event.detail);
    }

    // Add event listener
    window.addEventListener(SCORE_UPDATE, handleScoreUpdate);

    return () => {
      // Remove event listener
      window.removeEventListener(SCORE_UPDATE, handleScoreUpdate);
    };
  }, []);

  return (
    <div>
      <div>SCORE</div>
      <div className="digits">{padScore(score)}</div>
    </div>
  );
}

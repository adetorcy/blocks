import { useEffect, useState } from "react";
import { padScore } from "./utils";
import { SCORE_UPDATE_EVENT } from "./constants";

export default function Score() {
  const [score, setScore] = useState(0);

  // Event listeners
  useEffect(() => {
    function handleScoreUpdate(event) {
      setScore(event.detail);
    }

    // Add event listener
    window.addEventListener(SCORE_UPDATE_EVENT, handleScoreUpdate);

    return () => {
      // Remove event listener
      window.removeEventListener(SCORE_UPDATE_EVENT, handleScoreUpdate);
    };
  }, []);

  return (
    <div>
      <div>SCORE</div>
      <div className="scorevalue">{padScore(score)}</div>
    </div>
  );
}

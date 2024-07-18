import { useEffect, useRef } from "react";
import { clearCanvas, drawPiece } from "./drawing";
import { randomPiece } from "./pieces";

export default function Dashboard() {
  return (
    <div className="stack dashboard">
      <div className="card stack scorebox">
        <div>
          <div>SCORE</div>
          <div id="score">000</div>
        </div>
        <div>
          <div>LEVEL</div>
          <div id="level">000</div>
        </div>
        <div>
          <div>LINES</div>
          <div id="lines">000</div>
        </div>
      </div>
      <div className="card stack nextbox">
        <div>NEXT</div>
        <NextPiece />
      </div>
    </div>
  );
}

// Mockup with random piece
function NextPiece() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    drawPiece(randomPiece(), canvas);

    return () => {
      // cleanup
      clearCanvas(canvas);
    };
  }, []);

  return (
    <canvas height="160" width="160" ref={canvasRef} id="nextpiece"></canvas>
  );
}

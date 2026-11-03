import { OPPONENT_HEIGHT, OPPONENT_WIDTH } from "./constants";

// 2P: the other player's name, their line count and their board, under NEXT
// The border takes their level's color, white at level 0
// App draws their board in the canvas as their updates come in
// AWAY in place of their lines while they're silent
export default function OpponentCard({ name, lines, away, line, canvasRef }) {
  return (
    <div className="card stack opponent" style={{ "--line": line }}>
      <div className="opponent-name">{name}</div>
      <div className="opponent-lines">
        {away ? "AWAY" : String(lines).padStart(3, "0")}
      </div>
      <canvas
        ref={canvasRef}
        height={OPPONENT_HEIGHT}
        width={OPPONENT_WIDTH}
      ></canvas>
    </div>
  );
}

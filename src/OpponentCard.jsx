import { OPPONENT_HEIGHT, OPPONENT_WIDTH } from "./constants";

// 2P: the other player's name, their line count and their board, under NEXT
// The border takes their level's color, white at level 0
export default function OpponentCard({ name, lines, line }) {
  return (
    <div className="card stack opponent" style={{ "--line": line }}>
      <div className="opponent-name">{name}</div>
      <div className="opponent-lines">{String(lines).padStart(3, "0")}</div>
      <canvas height={OPPONENT_HEIGHT} width={OPPONENT_WIDTH}></canvas>
    </div>
  );
}

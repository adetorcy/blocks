import { padScore } from "./utils";

export default function Lines({ lines }) {
  return (
    <div>
      <div>LINES</div>
      <div className="digits">{padScore(lines)}</div>
    </div>
  );
}

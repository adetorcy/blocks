import { padScore } from "./utils";

export default function Score({ score }) {
  return (
    <div>
      <div>SCORE</div>
      <div className="digits">{padScore(score)}</div>
    </div>
  );
}

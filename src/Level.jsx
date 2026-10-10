import { padScore } from "./utils";

export default function Level({ level }) {
  return (
    <div>
      <div>LEVEL</div>
      <div className="digits">{padScore(level)}</div>
    </div>
  );
}

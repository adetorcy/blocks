import "./Dashboard.css";

export default function Dashboard() {
  return (
    <div className="dashboard">
      <div className="scorebox">
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
      <div className="nextbox">
        <div>NEXT</div>
        <canvas id="nextpiece"></canvas>
      </div>
    </div>
  );
}

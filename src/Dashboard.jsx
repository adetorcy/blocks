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
        <canvas id="nextpiece"></canvas>
      </div>
    </div>
  );
}

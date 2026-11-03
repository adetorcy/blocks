import { useEffect, useEffectEvent, useState } from "react";

// Seconds counted down
const COUNT = 3;

// 2P: 3 2 1 over the empty board, one second each, on both sides
// Timers can fire late on a hidden page
// So the count reads the clock instead of counting timeouts
// done() gets the time the count was due to end, even if it ended late
// The game starts from that time and catches up
export default function Countdown({ done }) {
  const [count, setCount] = useState(COUNT);
  // So a new done from App doesn't restart the count
  const end = useEffectEvent(done);

  useEffect(() => {
    const start = performance.now();
    const endTime = start + COUNT * 1000;
    let timeoutID;

    // Shows the seconds left, rounded up
    // The next timeout is due when the count changes
    const tick = () => {
      const left = endTime - performance.now();
      if (left <= 0) {
        end(endTime);
        return;
      }
      setCount(Math.ceil(left / 1000));
      timeoutID = setTimeout(tick, left % 1000 || 1000);
    };

    timeoutID = setTimeout(tick, 1000);
    return () => clearTimeout(timeoutID);
  }, []);

  return <div className="countdown">{count}</div>;
}

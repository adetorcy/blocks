import { useEffect, useEffectEvent, useState } from "react";

// 2P: 3 2 1 over the empty board, one second each, on both sides
// Then play starts (done)
export default function Countdown({ done }) {
  const [count, setCount] = useState(3);
  // So a new done from App doesn't restart the second
  const tick = useEffectEvent(() => {
    if (count > 1) setCount(count - 1);
    else done();
  });

  useEffect(() => {
    const timeoutID = setTimeout(tick, 1000);
    return () => clearTimeout(timeoutID);
  }, [count]);

  return <div className="countdown">{count}</div>;
}

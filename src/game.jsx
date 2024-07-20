import { useEffect, useRef } from "react";
import { BLOCK_SIZE } from "./drawing";

export default function Game({ escButtonCallback }) {
  const req = useRef();

  // Game Loop
  useEffect(() => {
    function loop(time) {
      console.log(time);
      req.current = requestAnimationFrame(loop);
    }

    // Start loop
    req.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(req.current);
    };
  }, []);

  // Keyboard event listeners
  useEffect(() => {
    function handleKeydown(event) {
      if (event.key === "Escape") {
        escButtonCallback();
      }
    }

    // Add event listener
    window.addEventListener("keydown", handleKeydown);

    return () => {
      // Remove event listener
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [escButtonCallback]);

  return (
    <canvas
      className="card"
      height={20 * BLOCK_SIZE}
      width={10 * BLOCK_SIZE}
    ></canvas>
  );
}

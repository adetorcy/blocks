import { useEffect } from "react";

export default function StartMenu({
  startButtonCallback,
  controlsButtonCallback,
}) {
  useEffect(() => {
    function handleKeydown(event) {
      console.log(`KeyboardEvent: key='${event.key}' | code='${event.code}'`);
    }

    window.addEventListener("keydown", handleKeydown);
    console.log("added event listener");

    return () => {
      // cleanup
      console.log("removing event listener");
      window.removeEventListener("keydown", handleKeydown);
    };
  }, []);

  return (
    <div className="playfield playfield-menu startmenu">
      <button className="btn" onClick={startButtonCallback}>
        START
      </button>
      <button className="btn" onClick={controlsButtonCallback}>
        CONTROLS
      </button>
    </div>
  );
}

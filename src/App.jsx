import { useEffect, useState } from "react";
import { BLOCK_SIZE } from "./drawing";
import Score from "./Score";
import Level from "./Level";
import Lines from "./Lines";
import StartMenu from "./StartMenu";
import ControlsMenu from "./ControlsMenu";
import PauseMenu from "./PauseMenu";
import * as game from "./game";

function App() {
  const [menu, setMenu] = useState("start");

  // User action callbacks
  const showStartMenu = () => setMenu("start");
  const showControlsMenu = () => setMenu("controls");
  const runGame = () => {
    game.run();
    setMenu(null);
  };
  const startGame = () => {
    game.start();
    setMenu(null);
  };
  const quitGame = () => {
    game.reset();
    setMenu("start");
  };

  // Keyboard event listeners
  useEffect(() => {
    // Enable pause button if game is running
    if (menu) return;

    function handleKeydown(event) {
      if (event.key === "Escape") {
        game.stop();
        setMenu("pause");
      }
    }

    // Add event listener
    window.addEventListener("keydown", handleKeydown);

    return () => {
      // Remove event listener
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [menu]);

  return (
    <>
      <div className="card gamearea">
        <canvas
          id="gameCanvas"
          className="baselayer"
          height={20 * BLOCK_SIZE}
          width={10 * BLOCK_SIZE}
        ></canvas>
        {
          // Overlay menu
          {
            start: <StartMenu {...{ showControlsMenu, startGame }} />,
            controls: <ControlsMenu {...{ showStartMenu }} />,
            pause: <PauseMenu {...{ runGame, quitGame }} />,
          }[menu] || null
        }
      </div>

      <div className="stack dashboard">
        <div className="card stack scorebox">
          <Score />
          <Level />
          <Lines />
        </div>
        <div className="card stack nextbox">
          <div>NEXT</div>
          <canvas
            id="nextPieceCanvas"
            height={4 * BLOCK_SIZE}
            width={4 * BLOCK_SIZE}
          ></canvas>
        </div>
      </div>
    </>
  );
}

export default App;

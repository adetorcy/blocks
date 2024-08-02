import { useEffect, useRef, useState } from "react";
import { BLOCK_SIZE, GAME_OVER_EVENT } from "./constants";
import { MOVE_KEY_CODES } from "./constants";
import Score from "./Score";
import Level from "./Level";
import Lines from "./Lines";
import StartMenu from "./StartMenu";
import ControlsMenu from "./ControlsMenu";
import PauseMenu from "./PauseMenu";
import GameOverMenu from "./GameOverMenu";
import Game from "./game";

function App() {
  const [menu, setMenu] = useState("start");
  const playfieldRef = useRef(null);
  const previewRef = useRef(null);
  const gameRef = useRef(new Game());

  // User action callbacks
  const showStartMenu = () => setMenu("start");
  const showControlsMenu = () => setMenu("controls");
  const runGame = () => {
    gameRef.current.run();
    setMenu(null);
  };
  const startGame = () => {
    gameRef.current.start(playfieldRef.current, previewRef.current);
    setMenu(null);
  };
  const quitGame = () => {
    gameRef.current.reset();
    setMenu("start");
  };

  // Keyboard event listeners
  useEffect(() => {
    // Enable pause button if game is running
    if (menu) return;

    function handleKeydown(event) {
      if (MOVE_KEY_CODES.has(event.code)) {
        gameRef.current.move(event.code);
      } else if (event.code === "Escape") {
        gameRef.current.stop();
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

  // Game event listeners
  useEffect(() => {
    function handleGameOver() {
      setMenu("gameOver");
    }

    // Add event listener
    window.addEventListener(GAME_OVER_EVENT, handleGameOver);

    return () => {
      // Remove event listener
      window.removeEventListener(GAME_OVER_EVENT, handleGameOver);
    };
  }, []);

  return (
    <>
      <div className="card gamearea">
        <canvas
          ref={playfieldRef}
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
            gameOver: <GameOverMenu {...{ quitGame }} />,
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
            ref={previewRef}
            height={4 * BLOCK_SIZE}
            width={4 * BLOCK_SIZE}
          ></canvas>
        </div>
      </div>
    </>
  );
}

export default App;

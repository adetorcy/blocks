import { useEffect, useRef, useState } from "react";
import { BLOCK_SIZE, GAME_OVER_EVENT } from "./constants";
import Score from "./Score";
import Level from "./Level";
import Lines from "./Lines";
import StartMenu from "./StartMenu";
import ControlsMenu from "./ControlsMenu";
import PauseMenu from "./PauseMenu";
import GameOverMenu from "./GameOverMenu";
import Game from "./game";

function App() {
  // UI
  const [menu, setMenu] = useState("start");

  // Game
  const gameRef = useRef(new Game());
  const playfieldRef = useRef(null);
  const previewRef = useRef(null);
  const fpsRef = useRef(0);

  // User action callbacks
  const showStartMenu = () => setMenu("start");
  const showControlsMenu = () => setMenu("controls");
  const runGame = () => {
    gameRef.current.run();
    setMenu(null);
  };
  const startGame = () => {
    gameRef.current.start(
      playfieldRef.current,
      previewRef.current,
      fpsRef.current
    );
    setMenu(null);
  };
  const quitGame = () => {
    gameRef.current.reset();
    setMenu("start");
  };

  // Listen for keyboard events
  useEffect(() => {
    // Only if game is running
    if (menu) return;

    function handleKeydown(event) {
      gameRef.current.keydown(event.code);
      if (event.code === "Escape") {
        setMenu("pause");
      }
    }

    function handleKeyup(event) {
      gameRef.current.keyup(event.code);
    }

    // Add event listeners
    window.addEventListener("keydown", handleKeydown);
    window.addEventListener("keyup", handleKeyup);

    return () => {
      // Remove event listeners
      window.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("keyup", handleKeyup);
    };
  }, [menu]);

  // Listen for game events
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
        <div className="stack cards">
          <div className="card stack score">
            <Score />
            <Level />
            <Lines />
          </div>
          <div className="card stack preview">
            <div>NEXT</div>
            <canvas
              ref={previewRef}
              height={4 * BLOCK_SIZE}
              width={4 * BLOCK_SIZE}
            ></canvas>
          </div>
        </div>
        <div className="card fps">
          <div ref={fpsRef}>0</div>
          <div>FPS</div>
        </div>
      </div>
    </>
  );
}

export default App;

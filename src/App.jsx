import { useEffect, useRef, useState } from "react";
import {
  PLAYFIELD_HEIGHT,
  PLAYFIELD_WIDTH,
  PREVIEW_BOX_SIZE,
} from "./constants";
import { GAME_OVER } from "./events";
import Score from "./Score";
import Level from "./Level";
import Lines from "./Lines";
import StartMenu from "./StartMenu";
import ControlsMenu from "./ControlsMenu";
import PauseMenu from "./PauseMenu";
import GameOverMenu from "./GameOverMenu";
import Keyboard from "./Keyboard";
import Game from "./game";
import SFX from "./sfx";
import {
  play,
  listenForKeydown,
  listenForKeyup,
  cleanupForKeydown,
  cleanupForKeyup,
} from "./utils";

function App() {
  // UI
  const [menu, setMenu] = useState("start");
  const [splash, setSplash] = useState(true);

  // Game
  const gameRef = useRef(null);
  const boardRef = useRef(null);
  const pieceRef = useRef(null);
  const previewRef = useRef(null);
  const fpsRef = useRef(0);

  // User action callbacks
  const showStartMenu = () => setMenu("start");
  const showControlsMenu = () => setMenu("controls");
  const resume = () => {
    play(SFX.resume);
    gameRef.current.run();
    setMenu(null);
  };
  const start = () => {
    gameRef.current = new Game(
      boardRef.current,
      pieceRef.current,
      previewRef.current,
      fpsRef.current
    );
    gameRef.current.run();
    setMenu(null);
  };
  const quit = () => {
    gameRef.current.cleanup();
    gameRef.current = null;
    setMenu("start");
  };

  // Listen for keyboard events, physical and on-screen
  useEffect(() => {
    // Only if game is running
    if (menu) return;

    function handleKeydown(event) {
      // Game
      if (gameRef.current.onkeydown(event.code)) event.preventDefault();

      // UI
      const gameArea = boardRef.current.parentElement;
      switch (event.code) {
        case "Escape":
          play(SFX.pause);
          setMenu("pause");
          break;
        case "Space":
          gameArea.classList.add("slam");
          setTimeout(() => {
            gameArea.classList.remove("slam");
          }, 200);
          break;
      }
    }

    function handleKeyup(event) {
      gameRef.current.keyup(event.code);
    }

    // Add event listeners
    listenForKeydown(handleKeydown);
    listenForKeyup(handleKeyup);

    return () => {
      // Remove event listeners
      cleanupForKeydown(handleKeydown);
      cleanupForKeyup(handleKeyup);
    };
  }, [menu]);

  // Listen for game events
  useEffect(() => {
    function handleGameOver() {
      const gameArea = boardRef.current.parentElement;
      gameArea.classList.add("vibrate");
      setTimeout(() => {
        gameArea.classList.remove("vibrate");
        setMenu("gameOver");
      }, 250);
    }

    // Add event listener
    window.addEventListener(GAME_OVER, handleGameOver);

    return () => {
      // Remove event listener
      window.removeEventListener(GAME_OVER, handleGameOver);
    };
  }, []);

  // One time splash screen effect
  useEffect(() => {
    setTimeout(() => setSplash(false), 500);
  }, []);

  if (splash) return <div className="splash">👾</div>;

  return (
    <>
      <div className={menu ? "game" : "game nocursor"}>
        <div className="card gamearea">
          <canvas
            ref={boardRef}
            className="board"
            height={PLAYFIELD_HEIGHT}
            width={PLAYFIELD_WIDTH}
          ></canvas>
          <canvas
            ref={pieceRef}
            className="piece"
            height={PLAYFIELD_HEIGHT}
            width={PLAYFIELD_WIDTH}
          ></canvas>
          {
            // Overlay menu
            {
              start: <StartMenu {...{ showControlsMenu, start }} />,
              controls: <ControlsMenu {...{ showStartMenu }} />,
              pause: <PauseMenu {...{ resume, quit }} />,
              gameOver: <GameOverMenu {...{ quit }} />,
            }[menu] || null
          }
        </div>
        <div className="stack dashboard">
          <div className="stack cards">
            <div className="card stack score">
              <Score />
              <Lines />
              <Level />
            </div>
            <div className="card stack preview">
              <div>NEXT</div>
              <canvas
                ref={previewRef}
                height={PREVIEW_BOX_SIZE}
                width={PREVIEW_BOX_SIZE}
              ></canvas>
            </div>
          </div>
          <div className="card fps">
            <div ref={fpsRef}>0</div>
            <div>FPS</div>
          </div>
        </div>
      </div>
      <Keyboard />
    </>
  );
}

export default App;

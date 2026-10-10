import { useEffect, useRef, useState } from "react";
import {
  PLAYFIELD_HEIGHT,
  PLAYFIELD_WIDTH,
  PREVIEW_BOX_SIZE,
} from "./constants";
import Score from "./Score";
import Level from "./Level";
import Lines from "./Lines";
import StartMenu from "./StartMenu";
import ControlsMenu from "./ControlsMenu";
import PauseMenu from "./PauseMenu";
import GameOverMenu from "./GameOverMenu";
import TouchUI from "./TouchUI";
import Game from "./game";
import Renderer from "./renderer";
import Loop from "./loop";
import useGameSnapshot from "./useGameSnapshot";
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
  // State so the snapshot hook resubscribes on start and quit
  const [game, setGame] = useState(null);
  const { score, lines, level, gameOver } = useGameSnapshot(game);
  const loopRef = useRef(null);
  const boardRef = useRef(null);
  const previewRef = useRef(null);
  const fpsRef = useRef(0);

  // User action callbacks
  const showStartMenu = () => setMenu("start");
  const showControlsMenu = () => setMenu("controls");
  const resume = () => {
    play(SFX.resume);
    loopRef.current.start();
    setMenu(null);
  };
  const start = () => {
    const newGame = new Game((name) => play(SFX[name]));
    loopRef.current = new Loop(
      newGame,
      new Renderer(boardRef.current, previewRef.current, fpsRef.current),
    );
    loopRef.current.start();
    setGame(newGame);
    setMenu(null);
  };
  const quit = () => {
    loopRef.current.stop();
    loopRef.current.renderer.clear();
    game.cleanup();
    loopRef.current = null;
    setGame(null);
    setMenu("start");
  };

  // Listen for keyboard events (physical and on-screen) and tab visibility
  useEffect(() => {
    // Only if game is running
    if (menu) return;

    function pause() {
      // Game over menu is on its way
      if (game.gameOver) return;

      loopRef.current.stop();
      setMenu("pause");
    }

    function handleKeydown(event) {
      // Ignore auto-repeat from held keys, DAS handles held keys
      if (event.repeat) {
        event.preventDefault();
        return;
      }

      // Game over, ignore input until the menu shows
      if (game.gameOver) return;

      // Pause
      if (event.code === "Enter") {
        event.preventDefault();
        play(SFX.pause);
        pause();
        return;
      }

      // Game
      if (game.onkeydown(event.code)) event.preventDefault();

      // UI
      if (event.code === "Space") {
        const gameArea = boardRef.current.parentElement;
        gameArea.classList.add("slam");
        setTimeout(() => {
          gameArea.classList.remove("slam");
        }, 200);
      }
    }

    function handleKeyup(event) {
      game.keyup(event.code);
    }

    // Auto-pause when the tab is hidden
    // requestAnimationFrame stops in background tabs
    function handleVisibilityChange() {
      if (document.hidden) pause();
    }

    // Add event listeners
    listenForKeydown(handleKeydown);
    listenForKeyup(handleKeyup);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      // Remove event listeners
      cleanupForKeydown(handleKeydown);
      cleanupForKeyup(handleKeyup);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [menu, game]);

  // Game over: vibrate then show menu
  useEffect(() => {
    if (!gameOver) return;

    const gameArea = boardRef.current.parentElement;
    gameArea.classList.add("vibrate");
    const timeoutID = setTimeout(() => {
      gameArea.classList.remove("vibrate");
      setMenu("gameOver");
    }, 250);

    return () => clearTimeout(timeoutID);
  }, [gameOver]);

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
              <Score score={score} />
              <Lines lines={lines} />
              <Level level={level} />
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
      <TouchUI menu={menu} />
    </>
  );
}

export default App;

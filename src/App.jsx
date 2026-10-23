import { useEffect, useRef, useState } from "react";
import {
  PLAYFIELD_HEIGHT,
  PLAYFIELD_WIDTH,
  PREVIEW_BOX_SIZE,
} from "./constants";
import Stat from "./Stat";
import StartMenu from "./StartMenu";
import ControlsMenu from "./ControlsMenu";
import PauseMenu from "./PauseMenu";
import GameOverMenu from "./GameOverMenu";
import TouchUI from "./TouchUI";
import Game from "./game";
import Renderer from "./renderer";
import Loop from "./loop";
import useGameSnapshot from "./useGameSnapshot";
import useFitScale from "./useFitScale";
import { playSound, resumeAudio } from "./sfx";
import { LEVEL_COLORS } from "./colors";
import { listenForKeydown, listenForKeyup } from "./utils";

// Sound effect for each game event
const GAME_EVENT_SFX = {
  move: "move",
  rotate: "rotate",
  lock: "lock",
  lineClear: "clear",
  tetris: "tetris",
  levelUp: "levelUp",
  stackDrop: "stackDrop",
  gameOver: "gameOver",
};

function App() {
  // UI
  // The cards are laid out from the start and hidden
  // So they're sized and scaled by the time a game starts (no jerkiness)
  const [menu, setMenu] = useState("start");
  // Title intro, once per page load
  const [intro, setIntro] = useState(true);
  const shellRef = useRef(null);
  useFitScale(shellRef);

  // Game
  // State so the snapshot hook resubscribes on start and quit
  const [game, setGame] = useState(null);
  const { score, lines, level, gameOver } = useGameSnapshot(game);
  const loopRef = useRef(null);
  const boardRef = useRef(null);
  const previewRef = useRef(null);
  const fpsRef = useRef(null);

  // Length of the last line clear or tetris sound
  // Level up comes on the same frame and waits for it to end
  const clearSoundLengthRef = useRef(0);

  // Callback to trigger effects not tied to game frames
  const handleGameEvent = (name) => {
    // Visual effects
    if (name === "hardDrop") {
      const gameArea = boardRef.current.parentElement;
      gameArea.classList.add("slam");
      setTimeout(() => {
        gameArea.classList.remove("slam");
      }, 200);
    }

    // Sound effects
    const sound = GAME_EVENT_SFX[name];
    if (!sound) return;
    const delay = name === "levelUp" ? clearSoundLengthRef.current : 0;
    const length = playSound(sound, delay);
    if (name === "lineClear" || name === "tetris") {
      clearSoundLengthRef.current = length;
    }
  };

  // User action callbacks
  const showStartMenu = () => setMenu("start");
  const showControlsMenu = () => {
    setIntro(false);
    setMenu("controls");
  };
  const resume = () => {
    resumeAudio();
    playSound("resume");
    loopRef.current.start();
    setMenu(null);
  };
  const start = () => {
    setIntro(false);
    resumeAudio();
    const newGame = new Game(handleGameEvent);
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
        playSound("pause");
        pause();
        return;
      }

      // Game
      if (game.onkeydown(event.code)) event.preventDefault();
    }

    function handleKeyup(event) {
      game.keyup(event.code);
    }

    // Auto-pause when the tab is hidden
    // requestAnimationFrame stops in background tabs
    function handleVisibilityChange() {
      if (document.hidden) pause();
    }

    const stopKeydown = listenForKeydown(handleKeydown);
    const stopKeyup = listenForKeyup(handleKeyup);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopKeydown();
      stopKeyup();
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

  // The home page and the screens it opens, cards hidden
  const home = menu === "start" || menu === "controls";

  // Card borders take the level color, white at level 0 only
  // From the snapshot, so it changes on the level up frame
  const line = level
    ? LEVEL_COLORS[(level - 1) % LEVEL_COLORS.length]
    : "var(--white)";

  return (
    <>
      <div
        ref={shellRef}
        className={`game${menu ? "" : " nocursor"}${home ? " home" : ""}`}
        style={{ "--line": line }}
      >
        <div className="card gamearea">
          <canvas
            ref={boardRef}
            height={PLAYFIELD_HEIGHT}
            width={PLAYFIELD_WIDTH}
          ></canvas>
          {
            // Windows over the board
            {
              pause: <PauseMenu {...{ resume, quit }} />,
              gameOver: <GameOverMenu {...{ quit }} />,
            }[menu] || null
          }
        </div>
        <div className="stack dashboard">
          <div className="stack cards">
            <div className="card stack score">
              <Stat label="SCORE" value={score} />
              <Stat label="LINES" value={lines} />
              <Stat label="LEVEL" value={level} />
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
        {
          // Home pages, on the whole game area
          {
            start: <StartMenu {...{ intro, showControlsMenu, start }} />,
            controls: <ControlsMenu {...{ showStartMenu }} />,
          }[menu] || null
        }
      </div>
      <TouchUI menu={menu} />
    </>
  );
}

export default App;

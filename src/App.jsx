import { useEffect, useRef, useState } from "react";
import {
  PLAYFIELD_HEIGHT,
  PLAYFIELD_WIDTH,
  PREVIEW_BOX_SIZE,
} from "./constants";
import Stat from "./Stat";
import StartMenu from "./StartMenu";
import ControlsMenu from "./ControlsMenu";
import AboutMenu from "./AboutMenu";
import NameMenu from "./NameMenu";
import WaitingMenu from "./WaitingMenu";
import JoiningMenu from "./JoiningMenu";
import VsMenu from "./VsMenu";
import ErrorMenu from "./ErrorMenu";
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
import { listenForPress, listenForRelease } from "./input";
import { TYPES, loadControlType, saveControlType } from "./controls";
import { newRoom, roomLink, readRoomLink, connect } from "./transport";
import { cleanName } from "./name";

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

// Join link: the other player's link opens the game with the room after the #
// Read once when the page loads
// Then cleared from the address bar so a reload doesn't join again
// A link opened in a tab already on the game doesn't reload the page
// So it's only read in a new tab
const openedWithLink = location.hash !== "";
// null for a broken link (INVALID LINK)
const linkRoom = readRoomLink(location.hash);
if (openedWithLink) {
  history.replaceState(null, "", location.pathname + location.search);
}

// The other player's name when nothing's left of it once cleaned
const NO_NAME = "PLAYER 2";

function App() {
  // UI
  // The cards are laid out from the start and hidden
  // So they're sized and scaled by the time a game starts (no jerkiness)
  // Opened with a join link: JOIN 2P GAME, asking YOUR NAME:
  // INVALID LINK if the link is broken
  const [menu, setMenu] = useState(() => {
    if (!openedWithLink) return "start";
    return linkRoom ? "name" : "setupError";
  });
  // Title intro, once per page load, not after a join link
  const [intro, setIntro] = useState(!openedWithLink);
  const shellRef = useRef(null);
  useFitScale(shellRef);

  // Control type, an index in TYPES
  const [controlType, setControlType] = useState(loadControlType);

  // Game
  // State so the snapshot hook resubscribes on start and quit
  const [game, setGame] = useState(null);
  const { score, lines, level, gameOver } = useGameSnapshot(game);
  const loopRef = useRef(null);
  const boardRef = useRef(null);
  const previewRef = useRef(null);
  const fpsRef = useRef(null);

  // 2P setup
  // Which side we're on: create, or join from a link
  const [side, setSide] = useState(openedWithLink ? "join" : "create");
  // The room from the join link, dropped once used
  const joinRoomRef = useRef(linkRoom);
  const connectionRef = useRef(null);
  // The link to send, the other player's name and why setup failed
  const [link, setLink] = useState(null);
  const [opponentName, setOpponentName] = useState(null);
  const [setupError, setSetupError] = useState(
    openedWithLink && !linkRoom ? "link" : null,
  );

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
  const pickControlType = (type) => {
    saveControlType(type);
    setControlType(type);
  };
  const showControlsMenu = () => {
    setIntro(false);
    setMenu("controls");
  };
  const showAboutMenu = () => {
    setIntro(false);
    setMenu("about");
  };
  const showNameMenu = () => {
    setIntro(false);
    setSide("create");
    setMenu("name");
  };
  // Both sides connect the same way
  // Each sends its name once connected
  // Receiving the other player's name shows VS and their name
  // A room left with CANCEL can still call back on its way out
  // Only the current connection counts
  const connectRoom = (room, name, joining) => {
    const current = () => connectionRef.current === connection;
    const connection = connect(room, {
      joining,
      onOpen: () => connection.send({ type: "hello", name }),
      onMessage: (message) => {
        if (!current() || message.type !== "hello") return;
        setOpponentName(cleanName(message.name) || NO_NAME);
        setMenu("vs");
      },
      // Silence only matters once the match starts
      onSilence: () => {},
      onError: (reason) => {
        if (!current()) return;
        connectionRef.current = null;
        setSetupError(reason);
        setMenu("setupError");
      },
    });
    connectionRef.current = connection;
  };
  // A new room, waiting for the other player to open its link
  const createGame = (name) => {
    const room = newRoom();
    connectRoom(room, name, false);
    setLink(roomLink(room, location.href));
    setMenu("waiting");
  };
  // Into the room from the join link
  // The link works once, CANCEL or an error drops it
  const joinGame = (name) => {
    connectRoom(joinRoomRef.current, name, true);
    joinRoomRef.current = null;
    setMenu("joining");
  };
  // Back home from the name screen drops the join link too
  const leaveNameMenu = () => {
    joinRoomRef.current = null;
    showStartMenu();
  };
  // Leave the room, the link stops working
  const cancelGame = () => {
    connectionRef.current?.leave();
    connectionRef.current = null;
    setMenu("start");
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

  // Listen for keys, touch buttons and tab visibility
  useEffect(() => {
    // Only if game is running
    if (menu) return;

    function pause() {
      // Game over menu is on its way
      if (game.gameOver) return;

      loopRef.current.stop();
      setMenu("pause");
    }

    const { keys, buttons } = TYPES[controlType];

    // Keys and buttons held down, each with its action
    // An action stays held until all its inputs are released
    // So letting go of one of two keys for the same action doesn't stop DAS
    const held = new Map();
    const isHeld = (action) => [...held.values()].includes(action);

    function press(input, action) {
      // Game over, ignore input until the menu shows
      if (game.gameOver) return;

      if (action === "pause") {
        playSound("pause");
        pause();
        return;
      }

      const wasHeld = isHeld(action);
      held.set(input, action);
      if (!wasHeld) game.press(action);
    }

    function release(input) {
      const action = held.get(input);
      if (!action) return;

      held.delete(input);
      if (!isHeld(action)) game.release(action);
    }

    function handleKeydown(event) {
      const action = keys[event.code];
      if (!action) return;

      event.preventDefault();
      // Ignore auto-repeat from held keys, DAS handles held keys
      if (!event.repeat) press(event.code, action);
    }

    function handleKeyup(event) {
      release(event.code);
    }

    // Button names are capitals, so they never clash with key codes
    function handleButtonPress(button) {
      const action = buttons[button];
      if (action) press(button, action);
    }

    // Auto-pause when the tab is hidden
    // requestAnimationFrame stops in background tabs
    function handleVisibilityChange() {
      if (document.hidden) pause();
    }

    const stopPress = listenForPress(handleKeydown, handleButtonPress);
    const stopRelease = listenForRelease(handleKeyup, release);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopPress();
      stopRelease();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // Leaving play (pause, hidden tab, game over) lets go of everything held
      for (const action of held.values()) game.release(action);
    };
  }, [menu, game, controlType]);

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
  const home = [
    "start",
    "controls",
    "about",
    "name",
    "waiting",
    "joining",
    "vs",
    "setupError",
  ].includes(menu);

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
            start: (
              <StartMenu
                {...{
                  intro,
                  showAboutMenu,
                  showControlsMenu,
                  showNameMenu,
                  start,
                }}
              />
            ),
            controls: (
              <ControlsMenu
                {...{ controlType, pickControlType, showStartMenu }}
              />
            ),
            about: <AboutMenu {...{ showStartMenu }} />,
            name: (
              <NameMenu
                side={side}
                confirm={side === "join" ? joinGame : createGame}
                back={leaveNameMenu}
              />
            ),
            waiting: <WaitingMenu link={link} cancel={cancelGame} />,
            joining: <JoiningMenu cancel={cancelGame} />,
            vs: <VsMenu side={side} name={opponentName} cancel={cancelGame} />,
            setupError: (
              <ErrorMenu side={side} reason={setupError} ok={showStartMenu} />
            ),
          }[menu] || null
        }
      </div>
      <TouchUI />
    </>
  );
}

export default App;

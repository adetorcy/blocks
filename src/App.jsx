import { useEffect, useRef, useState } from "react";
import {
  PLAYFIELD_HEIGHT,
  PLAYFIELD_WIDTH,
  PREVIEW_BOX_SIZE,
  TARGET_LINES,
} from "./constants";
import Stat from "./Stat";
import OpponentCard from "./OpponentCard";
import StartMenu from "./StartMenu";
import ControlsMenu from "./ControlsMenu";
import AboutMenu from "./AboutMenu";
import NameMenu from "./NameMenu";
import WaitingMenu from "./WaitingMenu";
import JoiningMenu from "./JoiningMenu";
import VsMenu from "./VsMenu";
import ErrorMenu from "./ErrorMenu";
import Countdown from "./Countdown";
import PauseMenu from "./PauseMenu";
import GameOverMenu from "./GameOverMenu";
import ResultMenu from "./ResultMenu";
import ConfirmWindow from "./ConfirmWindow";
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
import { randomSeed, sequence, seededRandom } from "./utils";
import { boardCells, isBoardState } from "./boardState";
import { isGarbage } from "./garbage";
import { matchResult, isEnd } from "./result";
import { drawOpponentBoard } from "./drawing";

// Sound effect for each game event
const GAME_EVENT_SFX = {
  move: "move",
  rotate: "rotate",
  lock: "lock",
  lineClear: "clear",
  tetris: "tetris",
  levelUp: "levelUp",
  stackDrop: "stackDrop",
  stackRise: "stackRise",
  // The game over sound comes with its window (1P)
  gameOver: "topOut",
};

// Sound for each 2P result, none for a draw
const RESULT_SFX = { win: "win", lose: "gameOver" };

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

// Card border color for a level, white at level 0 only
const levelLine = (level) =>
  level ? LEVEL_COLORS[(level - 1) % LEVEL_COLORS.length] : "var(--white)";

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
  // The name screen's OK creates or joins
  const [side, setSide] = useState(openedWithLink ? "join" : "create");
  // The room from the join link, dropped once used
  const joinRoomRef = useRef(linkRoom);
  const connectionRef = useRef(null);
  // Our name and the link to send, the other player's name and why setup failed
  const [ownName, setOwnName] = useState(null);
  const [link, setLink] = useState(null);
  const [opponentName, setOpponentName] = useState(null);
  // 2P once the other player's name has arrived, until we leave
  // The dashboard's cards are hidden until the game starts
  const multiplayer = opponentName !== null;
  const [setupError, setSetupError] = useState(
    openedWithLink && !linkRoom ? "link" : null,
  );
  // The other player's lines and level, their board goes straight to its canvas
  const [opponentLines, setOpponentLines] = useState(0);
  const [opponentLevel, setOpponentLevel] = useState(0);
  const [opponentAway, setOpponentAway] = useState(false);
  const opponentCanvasRef = useRef(null);
  // START GAME pressed on our side and on theirs
  // The creator starts both once both have pressed it
  const readyRef = useRef({ ours: false, theirs: false });
  // How each side's game ended, { frame, reason } (see matchResult)
  const ourEndRef = useRef(null);
  const theirEndRef = useRef(null);
  // The countdown is over, the 2P game has started
  const playingRef = useRef(false);
  // Who won, once both ends are known
  const [result, setResult] = useState(null);

  // When our last line clear, tetris or top-out sound ends (performance.now() time)
  // Level up comes on the same frame as a clear and waits for it to end
  // So does the 2P result window, with its sound
  const soundEndRef = useRef(0);
  const untilSoundEnd = () =>
    Math.max(0, soundEndRef.current - performance.now());
  const resultTimeoutRef = useRef(null);

  // Callback to trigger effects not tied to game frames
  const handleGameEvent = (name, rows) => {
    // 2P: a double, triple or tetris sends rows to the other player
    // No connection in 1P
    if (name === "garbage") {
      connectionRef.current?.send({ type: "garbage", rows });
    }

    // 2P: no sound or slam for frames run in a burst
    // Either while the page is hidden or when it comes back
    if (loopRef.current?.catchingUp) return;

    // Visual effects
    if (name === "hardDrop") {
      const shell = shellRef.current;
      shell.classList.add("slam");
      setTimeout(() => {
        shell.classList.remove("slam");
      }, 200);
    }

    // Sound effects
    const sound = GAME_EVENT_SFX[name];
    if (!sound) return;
    const delay = name === "levelUp" ? untilSoundEnd() : 0;
    const length = playSound(sound, delay);
    if (["lineClear", "tetris", "gameOver"].includes(name)) {
      soundEndRef.current = performance.now() + length;
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
    readyRef.current = { ours: false, theirs: false };
    const connection = connect(room, {
      joining,
      onOpen: () => connection.send({ type: "hello", name }),
      onMessage: (message) => {
        if (!current()) return;
        if (message.type === "hello") {
          setOpponentName(cleanName(message.name) || NO_NAME);
          setMenu("vs");
        }
        // They pressed START GAME
        if (message.type === "ready") {
          readyRef.current.theirs = true;
          if (!joining) startIfBothReady();
        }
        // Joiner: the creator's seed, both have pressed START GAME
        if (
          message.type === "start" &&
          joining &&
          readyRef.current.ours &&
          Number.isInteger(message.seed)
        ) {
          readyRef.current = { ours: false, theirs: false };
          startMatch(message.seed);
        }
        // Their double, triple or tetris
        // Queued in our game until the next spawn
        // Dropped if our game is already over
        if (message.type === "garbage" && isGarbage(message.rows)) {
          const game = loopRef.current?.game;
          if (game && !game.ended) game.receiveGarbage(message.rows);
        }
        // Their game ended
        // Ours plays on until their end frame at most
        // Past that nothing can change the result
        if (message.type === "end" && isEnd(message) && !theirEndRef.current) {
          theirEndRef.current = {
            frame: message.frame,
            reason: message.reason,
          };
          const game = loopRef.current?.game;
          if (game && !ourEndRef.current) {
            game.lastFrame = message.frame;
          }
          showResult();
        }
        // Their board, lines and level for their card
        if (message.type === "state" && isBoardState(message)) {
          const canvas = opponentCanvasRef.current;
          if (canvas) drawOpponentBoard(canvas.getContext("2d"), message.cells);
          setOpponentLines(message.lines);
          setOpponentLevel(message.level);
        }
      },
      // Silence only matters once the match starts
      // AWAY in their card while they're silent
      onSilence: (silent) => {
        if (current()) setOpponentAway(silent);
      },
      // The room is closed: they left, or one of us went silent too long
      // Before the game (countdown included): SAM LEFT, or CONNECTION LOST if it was us
      // During the game: the silent one or the one who left forfeits
      // Unless the result is already known
      onClose: (reason) => {
        if (!current()) return;
        connectionRef.current = null;

        if (!playingRef.current) {
          if (loopRef.current) endGame();
          setSetupError(reason === "away" ? "lost" : "left");
          setMenu("setupError");
          return;
        }

        if (ourEndRef.current && theirEndRef.current) return;
        loopRef.current.stop();
        openResult(
          reason === "away"
            ? { outcome: "lose", who: "you", reason: "forfeit" }
            : { outcome: "win", who: "opponent", reason: "forfeit" },
        );
      },
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
    setOwnName(name);
    const room = newRoom();
    connectRoom(room, name, false);
    setLink(roomLink(room, location.href));
    setMenu("waiting");
  };
  // Into the room from the join link
  // The link works once, CANCEL or an error drops it
  const joinGame = (name) => {
    setOwnName(name);
    connectRoom(joinRoomRef.current, name, true);
    joinRoomRef.current = null;
    setMenu("joining");
  };
  // Back home from the name screen drops the join link too
  const leaveNameMenu = () => {
    joinRoomRef.current = null;
    showStartMenu();
  };
  // START GAME on VS
  // Audio only starts on a user action
  // The game may start from a message, so audio starts here
  const ready = () => {
    resumeAudio();
    readyRef.current.ours = true;
    connectionRef.current.send({ type: "ready" });
    if (side === "create") startIfBothReady();
  };
  // Creator: picks the seed once both have pressed START GAME
  // Sends it and starts its own side
  // Reset so a repeated ready can't start it twice
  const startIfBothReady = () => {
    const { ours, theirs } = readyRef.current;
    if (!ours || !theirs) return;

    readyRef.current = { ours: false, theirs: false };
    const seed = randomSeed();
    connectionRef.current.send({ type: "start", seed });
    startMatch(seed);
  };
  // Leave the room, the link stops working
  // Back to 1P
  const leaveRoom = () => {
    connectionRef.current?.leave();
    connectionRef.current = null;
    setOpponentName(null);
  };
  const cancelGame = () => {
    leaveRoom();
    setMenu("start");
  };
  const resume = () => {
    resumeAudio();
    playSound("resume");
    loopRef.current.start();
    setMenu(null);
  };
  // 2P result once both ends are known, the same rule on both sides
  const showResult = () => {
    const [ours, theirs] = [ourEndRef.current, theirEndRef.current];
    if (!ours || !theirs) return;

    openResult(matchResult(ours, theirs));
  };
  // The result window and its sound, lose is the game over melody
  // They wait for our own clear, tetris or top-out sound to end
  // So a top-out's window comes after the shake, like GAME OVER
  const openResult = (result) => {
    resultTimeoutRef.current = setTimeout(() => {
      setResult(result);
      setMenu("result");
      const sound = RESULT_SFX[result.outcome];
      if (sound) playSound(sound);
    }, untilSoundEnd());
  };
  // New game and its loop, not started yet
  const newGame = (options, loopOptions) => {
    const game = new Game(handleGameEvent, options);
    loopRef.current = new Loop(
      game,
      new Renderer(boardRef.current, previewRef.current, fpsRef.current),
      loopOptions,
    );
    setGame(game);
  };
  const start = () => {
    setIntro(false);
    resumeAudio();
    newGame();
    loopRef.current.start();
    setMenu(null);
  };
  // 2P: the same pieces on both sides from the seed
  // The countdown starts the loop
  // Nothing is drawn until then, so the board and NEXT stay empty
  const startMatch = (seed) => {
    // Our board, lines and level for the other player's card
    // Sent after game frames, only when something changed
    let sent = null;
    const sendState = (game) => {
      const cells = boardCells(game);
      const state = `${cells} ${game.lines} ${game.level}`;
      if (state === sent) return;

      sent = state;
      connectionRef.current?.send({
        type: "state",
        cells,
        lines: game.lines,
        level: game.level,
      });
    };

    // How our game ended, sent once
    // A finish counts from finishFrame, before its clear plays out
    // stop: we reached lastFrame, their end frame
    const sendEnd = (game) => {
      if (ourEndRef.current) return;

      let end = null;
      if (game.gameOver) end = { frame: game.frameCount, reason: "topOut" };
      else if (game.finishFrame !== null) {
        end = { frame: game.finishFrame, reason: "finish" };
      } else if (game.ended) end = { frame: game.frameCount, reason: "stop" };
      if (!end) return;

      ourEndRef.current = end;
      connectionRef.current?.send({ type: "end", ...end });
      showResult();
    };

    ourEndRef.current = null;
    theirEndRef.current = null;
    playingRef.current = false;
    setResult(null);
    setOpponentLines(0);
    setOpponentLevel(0);
    setOpponentAway(false);
    newGame(
      {
        pieceSequence: sequence(seededRandom(seed)),
        targetLines: TARGET_LINES,
      },
      {
        afterFrames: (game) => {
          sendState(game);
          sendEnd(game);
        },
        // The other player plays on, our game never waits
        catchUp: true,
      },
    );
    setMenu("countdown");
  };
  // The game starts when the countdown was due to end
  // On a hidden page the countdown ends late, so the game catches up
  const endCountdown = (startTime) => {
    playingRef.current = true;
    loopRef.current.start(startTime);
    setMenu(null);
  };
  // Stop and clear the game, the dashboard resets
  const endGame = () => {
    clearTimeout(resultTimeoutRef.current);
    loopRef.current.stop();
    loopRef.current.renderer.clear();
    loopRef.current = null;
    setGame(null);
  };
  // In 2P we leave the room too
  const quit = () => {
    endGame();
    leaveRoom();
    setMenu("start");
  };

  // Listen for keys, touch buttons and tab visibility
  useEffect(() => {
    // Only if game is running
    if (menu) return;

    function pause() {
      // Game over menu or 2P result on its way
      if (game.ended) return;

      // 2P can't pause, the other player plays on
      // QUIT? instead, the game runs on behind it
      if (multiplayer) {
        setMenu("quit");
        return;
      }

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
      // Game over or 2P end, ignore input until the menu shows
      if (game.ended) return;

      if (action === "pause") {
        // Not for QUIT? in 2P, the game doesn't stop
        if (!multiplayer) playSound("pause");
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

    function releaseAll() {
      for (const action of new Set(held.values())) game.release(action);
      held.clear();
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
    // 2P doesn't pause or ask QUIT?, the game runs on without input
    // Held keys and buttons are let go, or DAS would keep going
    function handleVisibilityChange() {
      if (!document.hidden) return;
      if (multiplayer) releaseAll();
      else pause();
    }

    const stopPress = listenForPress(handleKeydown, handleButtonPress);
    const stopRelease = listenForRelease(handleKeyup, release);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopPress();
      stopRelease();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // Leaving play (pause, hidden tab, game over) lets go of everything held
      releaseAll();
    };
  }, [menu, game, controlType, multiplayer]);

  // Closing or leaving the page tells the other player (2P)
  // Best effort, going silent covers the rest
  useEffect(() => {
    const leave = () => connectionRef.current?.leave();
    window.addEventListener("pagehide", leave);
    return () => window.removeEventListener("pagehide", leave);
  }, []);

  // Game over: vibrate then show menu, with the game over sound
  // 2P shows the result instead, once both games have ended
  useEffect(() => {
    if (!gameOver) return;

    const shell = shellRef.current;
    shell.classList.add("vibrate");
    const timeoutID = setTimeout(() => {
      shell.classList.remove("vibrate");
      if (multiplayer) return;
      playSound("gameOver");
      setMenu("gameOver");
    }, 250);

    return () => clearTimeout(timeoutID);
  }, [gameOver, multiplayer]);

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

  // Card borders take the level color
  // From the snapshot, so it changes on the level up frame
  const line = levelLine(level);

  return (
    <>
      <div
        ref={shellRef}
        className={`game${!menu || menu === "countdown" ? " nocursor" : ""}${home ? " home" : ""}`}
        style={{ "--line": line }}
      >
        <div className="card playfield">
          <canvas
            ref={boardRef}
            height={PLAYFIELD_HEIGHT}
            width={PLAYFIELD_WIDTH}
          ></canvas>
          {
            // Windows over the board
            {
              countdown: <Countdown done={endCountdown} />,
              pause: <PauseMenu {...{ resume, quit }} />,
              quit: (
                <ConfirmWindow
                  title="QUIT?"
                  className="menu-quit"
                  no={() => setMenu(null)}
                  yes={quit}
                />
              ),
              gameOver: <GameOverMenu {...{ quit }} />,
              result: result && (
                <ResultMenu
                  result={result}
                  opponentName={opponentName}
                  ok={quit}
                />
              ),
            }[menu] || null
          }
        </div>
        <div className={`stack dashboard${multiplayer ? " multiplayer" : ""}`}>
          <div className="stack cards">
            {multiplayer ? (
              // Score doesn't decide a 2P game, lines do
              // One line makes room for the opponent's card
              <div className="card one-stat">
                <Stat label="LINES" value={lines} />
              </div>
            ) : (
              <div className="card stack score">
                <Stat label="SCORE" value={score} />
                <Stat label="LINES" value={lines} />
                <Stat label="LEVEL" value={level} />
              </div>
            )}
            <div className="card stack preview">
              <div>NEXT</div>
              <div className="preview-box">
                <canvas
                  ref={previewRef}
                  height={PREVIEW_BOX_SIZE}
                  width={PREVIEW_BOX_SIZE}
                ></canvas>
              </div>
            </div>
            {multiplayer && (
              <OpponentCard
                name={opponentName}
                lines={opponentLines}
                away={opponentAway}
                line={levelLine(opponentLevel)}
                canvasRef={opponentCanvasRef}
              />
            )}
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
                confirm={side === "join" ? joinGame : createGame}
                back={leaveNameMenu}
              />
            ),
            waiting: <WaitingMenu link={link} cancel={cancelGame} />,
            joining: <JoiningMenu cancel={cancelGame} />,
            vs: (
              <VsMenu
                ownName={ownName}
                opponentName={opponentName}
                ready={ready}
                cancel={cancelGame}
              />
            ),
            setupError: (
              <ErrorMenu
                reason={setupError}
                opponentName={opponentName}
                ok={cancelGame}
              />
            ),
          }[menu] || null
        }
      </div>
      <TouchUI />
    </>
  );
}

export default App;

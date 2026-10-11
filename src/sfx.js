/*** Sound Effects ***/

// G5, kalimba
import move from "./audio/move.wav";

// G5 C6, kalimba
import rotate from "./audio/rotate.wav";

// C7 then G6, two 50% pulse ticks 15 ms apart
import lock from "./audio/lock.wav";

// C5 E5 G5 B5 D6 G6 arpeggio, marimba notes ringing over each other
import clear from "./audio/clear.wav";

// E. piano chords sliding up by half steps into Cmaj7, over a low brass bass
// With a short SNES echo
import tetris from "./audio/tetris.wav";

// Soft e. piano Gadd9 chord, a glockenspiel B6 on top
import levelUp from "./audio/level-up.wav";

// Clatter: xylophone C4 A3 F3 within 25 ms over a dull thump of air noise
import stackDrop from "./audio/stack-drop.wav";

// Xylophone rattle during the board shake
// Then glockenspiel Eb6 D6 Eb6 D6 Db6 C6 over e. piano (Cm, Ab, G)
import gameOver from "./audio/game-over.wav";

// G5 up to C6, kalimba over a soft e. piano C chord
import pause from "./audio/pause.wav";

// C6 down to G5, kalimba over a soft e. piano C chord
import resume from "./audio/resume.wav";

// Sound files and their volume
// Balanced by loudness: tetris on top, then clear, level up and game over
// Stack drop, pause and resume below, the frequent move, rotate and lock quietest
const SFX = {
  move: [move, 1],
  rotate: [rotate, 0.8],
  lock: [lock, 0.75],
  clear: [clear, 1],
  tetris: [tetris, 1],
  levelUp: [levelUp, 0.85],
  stackDrop: [stackDrop, 1.25],
  gameOver: [gameOver, 0.8],
  pause: [pause, 1.2],
  resume: [resume, 1.2],
};

// Web Audio rather than <audio> elements
// Sounds are decoded once and play with low steady latency
// Each play gets its own source node so sounds can overlap
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
let context = null;
const buffers = {};

// Fetch files right away, decode them once the context exists
const files = Object.entries(SFX).map(([name, [url]]) =>
  fetch(url)
    .then((response) => response.arrayBuffer())
    .then((data) => [name, data]),
);

// Browsers only let audio start after a user gesture
// Call from a click or key handler (start, resume)
export function resumeAudio() {
  if (!context) {
    context = new AudioContext();
    files.forEach((file) =>
      file
        .then(([name, data]) =>
          context.decodeAudioData(data).then((buffer) => {
            buffers[name] = buffer;
          }),
        )
        .catch((error) => console.warn("Sound failed to load", error)),
    );
  }

  if (context.state !== "running") context.resume();
}

// Play a sound by name, optionally delayed (ms)
// Returns its length (ms), 0 if not decoded yet and skipped
export function playSound(name, delay = 0) {
  const buffer = buffers[name];
  if (!buffer) return 0;

  const source = context.createBufferSource();
  source.buffer = buffer;
  const gain = context.createGain();
  gain.gain.value = SFX[name][1];
  source.connect(gain).connect(context.destination);
  source.start(context.currentTime + delay / 1000);
  return buffer.duration * 1000;
}

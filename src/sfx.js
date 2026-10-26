/*** Sound Effects ***/

// Square, triangle and GB wave are band-limited (Clean in the sound lab), so they don't alias

// G5, GB wave
import move from "./audio/move.wav";

// G5 C6, GB wave
import rotate from "./audio/rotate.wav";

// Low thock, C4 dropping to G3 in 20 ms, GB wave
import lock from "./audio/lock.wav";

// C5 E5 G5 B5 D6 G6 arpeggio, GB wave
import clear from "./audio/clear.wav";

// Four coins zigzagging to C5 C6 E5 C6, short note then long
// Square, low-passed at 5 kHz, echo darker on every repeat
import tetris from "./audio/tetris.wav";

// C6 E6 G6 B6 arpeggio cycling every 60 ms and fading, GB wave
import levelUp from "./audio/level-up.wav";

// Noise thump with a triangle dropping C4 to C3
import stackDrop from "./audio/stack-drop.wav";

// Noise crash then a noise rattle during the board shake
// Then Eb5 D5 C5 B4 C5, GB wave, vibrato on C5, over a triangle bass C3 Ab2 G2 C3
import gameOver from "./audio/game-over.wav";

// G5 up to C6, GB wave
import pause from "./audio/pause.wav";

// C6 down to G5, GB wave
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

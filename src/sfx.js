// https://m2.material.io/design/sound/sound-resources.html

import tap from "./audio/ui_tap-variant-01.wav";
import lock from "./audio/ui_lock.wav";
import clear from "./audio/hero_simple-celebration-03.wav";
import clear4 from "./audio/hero_decorative-celebration-01.wav";
import levelUp from "./audio/notification_ambient.wav";
import pause from "./audio/state-change_confirm-up.wav";
import resume from "./audio/state-change_confirm-down.wav";
import buzz from "./audio/buzz.wav";

// Sound files and their volume
const SFX = {
  tap: [tap, 1],
  lock: [lock, 1],
  clear: [clear, 1],
  clear4: [clear4, 1],
  levelUp: [levelUp, 1],
  pause: [pause, 1],
  resume: [resume, 1],
  buzz: [buzz, 0.5],
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

// Play a sound by name
// Skipped if not decoded yet
export function playSound(name) {
  const buffer = buffers[name];
  if (!buffer) return;

  const source = context.createBufferSource();
  source.buffer = buffer;
  const gain = context.createGain();
  gain.gain.value = SFX[name][1];
  source.connect(gain).connect(context.destination);
  source.start();
}

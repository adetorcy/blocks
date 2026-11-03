// Game frame duration
// Both NES and GameBoy run at 60 frames per second (very close)
const FRAME_DURATION = 1000 / 60;

// Handle unexpected stalls
// MAX_ELAPSED limits how much real time a single loop callback can count
// 250ms is at most 15 game frames
// https://gafferongames.com/post/fix_your_timestep/
const MAX_ELAPSED = 250;

// How often a hidden page runs its missed frames (2P)
// Browsers run a hidden page's timers once a second at most
const HIDDEN_INTERVAL = 1000;

// Fixed timestep loop
// Runs one game frame per 1/60 second
// Draws once per display refresh
// afterFrames(game) runs before each draw (2P sends our board to the other player)
//
// catchUp (2P): every missed frame runs, the other player doesn't wait
// No MAX_ELAPSED cap keeps the frame count in step with the clock
// A hidden page gets no requestAnimationFrame, so a timer runs its frames
// A phone freezes the page completely and it catches up when it's back
// catchingUp is true while frames run in a burst, App mutes their sounds
export default class Loop {
  constructor(game, renderer, { afterFrames = null, catchUp = false } = {}) {
    this.game = game;
    this.renderer = renderer;
    this.afterFrames = afterFrames;
    this.catchUp = catchUp;
    this.catchingUp = false;
    this.requestID = null;
    this.intervalID = null;
  }

  // from: when the game started, as a performance.now() time
  // The first callback then runs the frames since then (2P countdown)
  start(from = null) {
    // Sanity check
    if (this.requestID !== null) return;

    // Always use a fresh clock so resuming doesn't try to catch up on paused time
    this.lastTime = from;
    this.elapsed = 0;

    this.requestID = requestAnimationFrame((now) => this.tick(now));
    if (this.catchUp) {
      this.intervalID = setInterval(() => {
        if (document.hidden) this.runFrames(performance.now(), true);
      }, HIDDEN_INTERVAL);
    }
  }

  stop() {
    cancelAnimationFrame(this.requestID);
    clearInterval(this.intervalID);
    this.requestID = null;
    this.intervalID = null;
  }

  // Run one game frame for each 1/60 second elapsed since the last call
  // First call after start() adds nothing, unless start() was given a time
  runFrames(now, hidden = false) {
    if (this.lastTime === null) this.lastTime = now;
    const elapsed = now - this.lastTime;
    this.elapsed += this.catchUp ? elapsed : Math.min(elapsed, MAX_ELAPSED);
    this.lastTime = now;

    this.catchingUp = hidden || (this.catchUp && this.elapsed > MAX_ELAPSED);
    while (this.elapsed >= FRAME_DURATION && !this.game.ended) {
      this.game.frame();
      this.elapsed -= FRAME_DURATION;
    }
    this.catchingUp = false;

    this.afterFrames?.(this.game);
  }

  tick(now) {
    this.runFrames(now);

    // Single redraw from game state
    this.renderer.render(this.game, now);

    // GAME OVER or FINISHED (2P)
    // final state has been drawn, stop here
    if (this.game.ended) {
      this.stop();
      return;
    }

    this.requestID = requestAnimationFrame((now) => this.tick(now));
  }
}

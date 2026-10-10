// Game frame duration
// Both NES and GameBoy run at 60 frames per second (very close)
const FRAME_DURATION = 1000 / 60;

// Handle unexpected stalls
// MAX_ELAPSED limits how much real time a single loop callback can count
// 250ms is at most 15 game frames
// https://gafferongames.com/post/fix_your_timestep/
const MAX_ELAPSED = 250;

// Fixed timestep loop
// Runs one game frame per 1/60 second
// Draws once per display refresh
export default class Loop {
  constructor(game, renderer) {
    this.game = game;
    this.renderer = renderer;
    this.requestID = null;
  }

  start() {
    // Sanity check
    if (this.requestID !== null) return;

    // Always use a fresh clock so resuming doesn't try to catch up on paused time
    this.lastTime = null;
    this.elapsed = 0;

    this.requestID = requestAnimationFrame((now) => this.tick(now));
  }

  stop() {
    cancelAnimationFrame(this.requestID);
    this.requestID = null;
  }

  tick(now) {
    // Accumulate real time to know how many game frames to run
    // First callback after start() adds nothing
    if (this.lastTime === null) this.lastTime = now;
    this.elapsed += Math.min(now - this.lastTime, MAX_ELAPSED);
    this.lastTime = now;

    // Run one game frame for each 1/60 second elapsed
    while (this.elapsed >= FRAME_DURATION && !this.game.gameOver) {
      this.game.frame();
      this.elapsed -= FRAME_DURATION;
    }

    // Single redraw from game state
    this.renderer.render(this.game, now);

    // GAME OVER
    // final state has been drawn, stop here
    if (this.game.gameOver) {
      this.requestID = null;
      return;
    }

    this.requestID = requestAnimationFrame((now) => this.tick(now));
  }
}

import { useEffect } from "react";

// Space around the game
const MARGIN = 16;

// Scales the game to fit its container (the screen minus the touch controls)
// Sets --scale on the game element for its transform
// Never above 1 or the canvases would blur
// Do this in JS because scale() wants a plain number
// and CSS can't divide a length by a length
// Media queries (and useMediaQuery) only give breakpoints, not a smooth fit
// (Container query units would mean rewriting every size in the game)
// Here CSS lays out the container and we measure it and divide
// Then snaps scale and position so virtual pixels stay crisp (see fit)
export default function useFitScale(ref, enabled) {
  useEffect(() => {
    if (!enabled) return;

    const game = ref.current;
    const container = game.parentElement;

    // A virtual pixel (4px) should cover a whole number of device pixels
    // Below 1 the scale snaps down to the nearest step where it does
    // e.g. steps of 1/12 on a 3x phone (3 device pixels per CSS pixel)
    // Above that the game stays at 1, so browser zoom isn't undone
    // Then the game's corner moves to the nearest device pixel
    // Every size in the game is a multiple of 4, so every edge lands on one
    function fit() {
      const width = (container.clientWidth - 2 * MARGIN) / game.offsetWidth;
      const height = (container.clientHeight - 2 * MARGIN) / game.offsetHeight;
      const scale = Math.min(width, height);

      // Device pixels per virtual pixel at scale 1
      const pixel = 4 * devicePixelRatio;
      game.style.setProperty(
        "--scale",
        scale < 1 ? Math.max(1, Math.floor(scale * pixel)) / pixel : 1,
      );

      // Measured without the previous shift
      game.style.setProperty("--snap-x", "0px");
      game.style.setProperty("--snap-y", "0px");
      const { left, top } = game.getBoundingClientRect();
      const snap = (n) =>
        Math.round(n * devicePixelRatio) / devicePixelRatio - n;
      game.style.setProperty("--snap-x", `${snap(left)}px`);
      game.style.setProperty("--snap-y", `${snap(top)}px`);
    }

    // Container resizes with the window and the touch controls
    // Game resizes when the font loads and widens the dashboard
    // Transforms don't change observed sizes so there's no feedback loop
    const observer = new ResizeObserver(fit);
    observer.observe(container);
    observer.observe(game);

    return () => observer.disconnect();
  }, [ref, enabled]);
}

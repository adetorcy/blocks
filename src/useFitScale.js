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
    // Then the position snaps too (below), so every edge lands on a device pixel
    // (every size in the game is a multiple of 4)
    function fit() {
      const width = (container.clientWidth - 2 * MARGIN) / game.offsetWidth;
      const height = (container.clientHeight - 2 * MARGIN) / game.offsetHeight;
      const fitted = Math.min(width, height);

      // Device pixels per virtual pixel at scale 1
      const pixel = 4 * devicePixelRatio;
      const scale =
        fitted < 1 ? Math.max(1, Math.floor(fitted * pixel)) / pixel : 1;
      game.style.setProperty("--scale", scale);

      // Chrome draws a scaled element from its layout position rounded to whole CSS pixels
      // A half pixel there (odd screen width) put the whole game one device pixel off
      // So the layout position snaps to whole CSS pixels that are also whole device pixels
      // e.g. multiples of 8 at a 2.625 ratio (21 device pixels)
      // Scaled from the top center, the corner then lands on a device pixel too
      const step =
        [1, 2, 3, 4, 5, 6, 7, 8].find((n) =>
          Number.isInteger(n * devicePixelRatio),
        ) ?? 1;
      const snap = (n) => Math.round(n / step) * step - n;

      // Measured without the previous shift
      game.style.setProperty("--snap-x", "0px");
      game.style.setProperty("--snap-y", "0px");
      const { left, top } = game.getBoundingClientRect();
      // Layout position, before the scale
      const x = left - (game.offsetWidth * (1 - scale)) / 2;
      game.style.setProperty("--snap-x", `${snap(x)}px`);
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

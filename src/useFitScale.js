import { useEffect } from "react";

// Space around the game
const MARGIN = 16;

// Card shadow sticks out past the game box
const SHADOW = 8;

// Scales the game to fit its container (the screen minus the touch controls)
// Sets --scale on the game element for its transform
// Never above 1 or the canvases would blur
// Do this in JS because scale() wants a plain number
// and CSS can't divide a length by a length
// Media queries (and useMediaQuery) only give breakpoints, not a smooth fit
// (Container query units would mean rewriting every size in the game)
// Here CSS lays out the container and we measure it and divide
export default function useFitScale(ref, enabled) {
  useEffect(() => {
    if (!enabled) return;

    const game = ref.current;
    const container = game.parentElement;

    function fit() {
      const width =
        (container.clientWidth - 2 * MARGIN) / (game.offsetWidth + SHADOW);
      const height =
        (container.clientHeight - 2 * MARGIN) / (game.offsetHeight + SHADOW);
      game.style.setProperty("--scale", Math.min(1, width, height));
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

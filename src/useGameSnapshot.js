import { useSyncExternalStore } from "react";

// Snapshot when no game is running, resets the score card
const NO_GAME = { score: 0, lines: 0, level: 0, gameOver: false };

function noSubscription() {
  return () => {};
}

// Game state for React, re-renders when the game notifies a change
// Resubscribes when the game changes
export default function useGameSnapshot(game) {
  return useSyncExternalStore(
    game ? game.subscribe : noSubscription,
    game ? game.getSnapshot : () => NO_GAME,
  );
}

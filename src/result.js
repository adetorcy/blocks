import { DRAW_FRAMES } from "./constants";

// 2P result from both players' ends, the same rule on both sides
// An end is { frame, reason }
// reason is "finish" (reached the target lines), "topOut" or "stop"
// "stop" is the player still playing at the other's end + DRAW_FRAMES
// The first finish or top-out decides: a finish wins, a top-out loses
// The same reason within DRAW_FRAMES of each other is a draw
// who did it: "you", "opponent" or "both" (a draw)
export function matchResult(ours, theirs) {
  const decides = (end) => end.reason !== "stop";

  if (
    decides(ours) &&
    decides(theirs) &&
    ours.reason === theirs.reason &&
    Math.abs(ours.frame - theirs.frame) <= DRAW_FRAMES
  ) {
    return { outcome: "draw", who: "both", reason: ours.reason };
  }

  // On the same frame the reasons differ, so either end gives the same outcome
  const oursFirst =
    decides(ours) && (!decides(theirs) || ours.frame <= theirs.frame);
  const { reason } = oursFirst ? ours : theirs;
  const good = reason === "finish";

  return {
    outcome: good === oursFirst ? "win" : "lose",
    who: oursFirst ? "you" : "opponent",
    reason,
  };
}

const REASONS = ["finish", "topOut", "stop"];

// Checks an end message from the other player
export function isEnd({ frame, reason }) {
  return Number.isInteger(frame) && frame >= 0 && REASONS.includes(reason);
}

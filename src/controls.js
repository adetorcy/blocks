// Game action for each key and touch button
// pause is handled by App, the other actions by Game.press() and Game.release()
export const KEY_ACTIONS = {
  ArrowLeft: "moveLeft",
  ArrowRight: "moveRight",
  ArrowDown: "softDrop",
  Space: "hardDrop",
  ArrowUp: "rotateRight",
  KeyX: "rotateRight",
  KeyZ: "rotateLeft",
  Enter: "pause",
};

export const BUTTON_ACTIONS = {
  LEFT: "moveLeft",
  RIGHT: "moveRight",
  DOWN: "softDrop",
  A: "hardDrop",
  UP: "rotateRight",
  B: "rotateLeft",
  START: "pause",
};

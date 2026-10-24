// Control types: a few common presets to pick from
// Each type sets keys and touch buttons together
// Each maps key codes (keys) and button names (buttons) to game actions
// pause is handled by App, the other actions by Game.press() and Game.release()
// The controls screen lists the keys in the order they're written here

// The same in every type
// Arrows and WASD both move, Z X for arrow players, J K for WASD players
// Enter pauses like START, Esc like most PC games
const KEYS = {
  ArrowLeft: "moveLeft",
  KeyA: "moveLeft",
  ArrowRight: "moveRight",
  KeyD: "moveRight",
  ArrowDown: "softDrop",
  KeyS: "softDrop",
  KeyZ: "rotateLeft",
  KeyJ: "rotateLeft",
  KeyX: "rotateRight",
  KeyK: "rotateRight",
  Enter: "pause",
  Escape: "pause",
};

const BUTTONS = {
  LEFT: "moveLeft",
  RIGHT: "moveRight",
  DOWN: "softDrop",
  B: "rotateLeft",
  START: "pause",
};

export const TYPES = [
  // AdT layout: hard drop on Space or A, UP rotates right
  {
    name: "TYPE 1",
    keys: {
      ...KEYS,
      Space: "hardDrop",
      ArrowUp: "rotateRight",
      KeyW: "rotateRight",
    },
    buttons: { ...BUTTONS, A: "hardDrop", UP: "rotateRight" },
  },
  // Hard drop on UP, like Tetris 99, A and B rotate
  {
    name: "TYPE 2",
    keys: { ...KEYS, Space: "hardDrop", ArrowUp: "hardDrop", KeyW: "hardDrop" },
    buttons: { ...BUTTONS, A: "rotateRight", UP: "hardDrop" },
  },
  // Classic NES and Game Boy: no hard drop, A and B rotate, UP does nothing
  {
    name: "TYPE 3",
    keys: KEYS,
    buttons: { ...BUTTONS, A: "rotateRight" },
  },
];

// The picked type, as an index in TYPES, kept between visits
// Storage can throw (private window, blocked site data), the game then starts on TYPE 1
const STORAGE_KEY = "blocks:controlType";

export function loadControlType() {
  try {
    const type = Number(localStorage.getItem(STORAGE_KEY));
    return TYPES[type] ? type : 0;
  } catch {
    return 0;
  }
}

export function saveControlType(type) {
  try {
    localStorage.setItem(STORAGE_KEY, type);
  } catch {
    // Not kept, the type still applies until the page reloads
  }
}

// Touch button events
// The touch controls are their own device, not a virtual keyboard
// They send the button's name (UP, DOWN, LEFT, RIGHT, A, B, START), keys stay keyboard events
const TOUCH_PRESS = "blocks:touch-press";
const TOUCH_RELEASE = "blocks:touch-release";

export function pressButton(button) {
  dispatchEvent(new CustomEvent(TOUCH_PRESS, { detail: button }));
}

export function releaseButton(button) {
  dispatchEvent(new CustomEvent(TOUCH_RELEASE, { detail: button }));
}

// Calls handleKey(event) for keys and handleButton(button) for touch buttons
// Returns the cleanup, so an effect can return it as is
function listen(keyEvent, touchEvent, handleKey, handleButton) {
  const handleTouch = (event) => handleButton(event.detail);
  window.addEventListener(keyEvent, handleKey);
  window.addEventListener(touchEvent, handleTouch);

  return () => {
    window.removeEventListener(keyEvent, handleKey);
    window.removeEventListener(touchEvent, handleTouch);
  };
}

export function listenForPress(handleKey, handleButton) {
  return listen("keydown", TOUCH_PRESS, handleKey, handleButton);
}

export function listenForRelease(handleKey, handleButton) {
  return listen("keyup", TOUCH_RELEASE, handleKey, handleButton);
}

// Menu input, the same whatever the game controls
const MENU_KEYS = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  Enter: "confirm",
  Space: "confirm",
  KeyZ: "back",
};

const MENU_BUTTONS = {
  UP: "up",
  DOWN: "down",
  LEFT: "left",
  RIGHT: "right",
  A: "confirm",
  START: "confirm",
  B: "back",
};

// Calls handleMenuInput(name, repeat) with up, down, left, right, confirm or back
// repeat is true for auto-repeat from a held key
export function listenForMenuInput(handleMenuInput) {
  function handleKey(event) {
    const name = MENU_KEYS[event.code];
    if (!name) return;

    event.preventDefault();
    handleMenuInput(name, event.repeat);
  }

  function handleButton(button) {
    const name = MENU_BUTTONS[button];
    if (name) handleMenuInput(name, false);
  }

  return listenForPress(handleKey, handleButton);
}

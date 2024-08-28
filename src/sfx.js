/**
 * Audio by Material Design: https://m2.material.io/design/sound/sound-resources.html
 **/

import tap from "./audio/ui_tap-variant-01.wav";
import lock from "./audio/ui_lock.wav";
import clear from "./audio/hero_simple-celebration-03.wav";
import clear4 from "./audio/hero_decorative-celebration-02.wav";
import levelUp from "./audio/notification_ambient.wav";
import pause from "./audio/state-change_confirm-up.wav";
import resume from "./audio/state-change_confirm-down.wav";
import fail from "./audio/alert_error-01.wav";

const SFX = {
  tap: new Audio(tap),
  lock: new Audio(lock),
  clear: new Audio(clear),
  clear4: new Audio(clear4),
  levelUp: new Audio(levelUp),
  pause: new Audio(pause),
  resume: new Audio(resume),
  fail: new Audio(fail),
};

export default SFX;

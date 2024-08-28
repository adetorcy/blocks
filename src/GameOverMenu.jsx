import { autoFocusRef } from "./utils";

export default function GameOverMenu({ quit }) {
  return (
    <div className="stack menu menu-pause">
      <div>GAME OVER</div>
      <button ref={autoFocusRef} onClick={quit}>
        OK
      </button>
    </div>
  );
}

import { autoFocusRef } from "./utils";

export default function GameOverMenu({ quitGame }) {
  return (
    <div className="stack menu menu-pause toplayer">
      <div>GAME OVER</div>
      <button ref={autoFocusRef} onClick={quitGame}>
        OK
      </button>
    </div>
  );
}

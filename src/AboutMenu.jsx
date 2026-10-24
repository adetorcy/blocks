import { useEffect } from "react";
import { listenForMenuInput } from "./input";
import { version } from "../package.json";

export default function AboutMenu({ showStartMenu }) {
  useEffect(() => {
    function handleMenuInput(name, repeat) {
      // OK, or back, both to the start menu
      // Ignore auto-repeat from a held key
      if ((name === "confirm" || name === "back") && !repeat) showStartMenu();
    }

    return listenForMenuInput(handleMenuInput);
  }, [showStartMenu]);

  return (
    <div className="stack menu menu-about">
      <div>BLOCKS v{version}</div>
      <div className="menu-option selected" onClick={showStartMenu}>
        OK
      </div>
    </div>
  );
}

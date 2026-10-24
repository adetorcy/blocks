import { useEffect, useRef, useState } from "react";
import { listenForMenuInput } from "./input";
import Title from "./Title";

// Action-label pairs, no action for options not there yet
// Those are grayed out and the arrows skip them
const OPTIONS = [
  ["start", "START 1P GAME"],
  [null, "CREATE 2P GAME"],
  [null, "JOIN 2P GAME"],
  ["controls", "CONTROLS"],
  ["about", "ABOUT"],
];

// Indexes the arrows go through
const ENABLED = OPTIONS.flatMap(([action], i) => (action ? [i] : []));

export default function StartMenu({
  intro,
  showAboutMenu,
  showControlsMenu,
  start,
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedRef = useRef(null);

  useEffect(() => {
    // Next enabled option up or down, wrapping around
    function move(step) {
      setSelectedIndex((index) => {
        const at = ENABLED.indexOf(index);
        return ENABLED[(at + step + ENABLED.length) % ENABLED.length];
      });
    }

    function handleMenuInput(name, repeat) {
      if (name === "up") move(-1);
      if (name === "down") move(1);
      // Ignore auto-repeat from a held key
      if (name === "confirm" && !repeat) selectedRef.current.click();
    }

    return listenForMenuInput(handleMenuInput);
  }, []);

  const actions = { start, controls: showControlsMenu, about: showAboutMenu };

  return (
    <div className={intro ? "home-page intro" : "home-page"}>
      <Title />
      <div className="stack menu menu-start">
        {OPTIONS.map(([action, label], i) => {
          const selected = i === selectedIndex;
          const className = !action
            ? "menu-option disabled"
            : selected
              ? "menu-option selected"
              : "menu-option";
          return (
            <div
              key={i}
              ref={selected ? selectedRef : null}
              className={className}
              onClick={actions[action]}
            >
              {label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

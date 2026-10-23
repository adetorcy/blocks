import { useEffect, useRef, useState } from "react";
import { listenForKeydown } from "./utils";
import Title from "./Title";

// Action-label pairs, no action for options not there yet
// Those are grayed out and the arrows skip them
const OPTIONS = [
  ["start", "START 1P GAME"],
  [null, "CREATE 2P GAME"],
  [null, "JOIN 2P GAME"],
  ["controls", "CONTROLS"],
  [null, "SETTINGS"],
  [null, "ABOUT"],
];

// Indexes the arrows go through
const ENABLED = OPTIONS.flatMap(([action], i) => (action ? [i] : []));

export default function StartMenu({ intro, showControlsMenu, start }) {
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

    // Callback for keydown event listener
    function handleKeydown(event) {
      switch (event.code) {
        case "ArrowUp":
          move(-1);
          event.preventDefault();
          break;
        case "ArrowDown":
          move(1);
          event.preventDefault();
          break;
        case "Enter":
        case "Space":
          // Ignore auto-repeat from a held key
          if (!event.repeat) selectedRef.current.click();
          event.preventDefault();
          break;
      }
    }

    return listenForKeydown(handleKeydown);
  }, []);

  const actions = { start, controls: showControlsMenu };

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

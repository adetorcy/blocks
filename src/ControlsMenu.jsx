import { Fragment, useEffect, useState } from "react";
import { listenForMenuInput } from "./input";
import { TYPES } from "./controls";

// Table rows, one per game action
const ACTIONS = [
  ["moveLeft", "MOVE LEFT"],
  ["moveRight", "MOVE RIGHT"],
  ["softDrop", "SOFT DROP"],
  ["hardDrop", "HARD DROP"],
  ["rotateRight", "ROTATE RIGHT"],
  ["rotateLeft", "ROTATE LEFT"],
  ["pause", "PAUSE"],
];

// Key code to label: ArrowLeft is LEFT, KeyA is A, Space is SPACE
const keyLabel = (code) => code.replace(/^(Arrow|Key)/, "").toUpperCase();

// The inputs mapped to an action, NONE in gray if there are none
// Button names are their own labels
function Inputs({ map, action, label = (name) => name }) {
  const names = Object.keys(map).filter((name) => map[name] === action);
  if (!names.length) return <div className="gray">NONE</div>;
  return <div>{names.map(label).join(", ")}</div>;
}

// Control types on one row, the whole layout of the current one under them
// Left and right pick a type, it applies right away
// Up and down go between the types and OK
export default function ControlsMenu({
  controlType,
  pickControlType,
  showStartMenu,
}) {
  // The types row or OK
  const [onTypes, setOnTypes] = useState(true);

  useEffect(() => {
    function handleMenuInput(name, repeat) {
      if (name === "up" || name === "down") setOnTypes((on) => !on);
      if (onTypes && (name === "left" || name === "right")) {
        const step = name === "left" ? -1 : 1;
        pickControlType((controlType + step + TYPES.length) % TYPES.length);
      }

      // Ignore auto-repeat from a held key
      if (repeat) return;
      if (name === "back") showStartMenu();
      if (name === "confirm") {
        if (onTypes) setOnTypes(false);
        else showStartMenu();
      }
    }

    return listenForMenuInput(handleMenuInput);
  }, [onTypes, controlType, pickControlType, showStartMenu]);

  const { keys, buttons } = TYPES[controlType];

  return (
    <div className="stack menu menu-controls">
      <div className="control-types">
        {TYPES.map(({ name }, i) => {
          const current = i === controlType;
          let className = "menu-option control-type";
          if (current) className += " current";
          if (current && onTypes) className += " selected";
          return (
            <div
              key={name}
              className={className}
              onClick={() => {
                setOnTypes(true);
                pickControlType(i);
              }}
            >
              {name}
            </div>
          );
        })}
      </div>
      <div className="controls-table">
        {/* Nothing over the actions */}
        <div></div>
        <div className="gray">KEYS</div>
        <div className="gray">TOUCH</div>
        {ACTIONS.map(([action, label]) => (
          <Fragment key={action}>
            <div>{label}</div>
            <Inputs map={keys} action={action} label={keyLabel} />
            <Inputs map={buttons} action={action} />
          </Fragment>
        ))}
      </div>
      <div
        className={onTypes ? "menu-option" : "menu-option selected"}
        onClick={showStartMenu}
      >
        OK
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { listenForMenuInput } from "./input";
import { cleanName, typedName, loadName, saveName, NAME_LENGTH } from "./name";

// Saved and passed on if anything's left once cleaned
// Nothing happens otherwise and OK is grayed out
function submit(name, confirm) {
  const cleaned = cleanName(name);
  if (!cleaned) return;
  saveName(cleaned);
  confirm(cleaned);
}

// 2P name, asked after CREATE 2P GAME or on opening a join link
// Prefilled with the saved name so later visits are one OK
// Enter in the field is OK and Esc goes back (see listenForMenuInput)
export default function NameMenu({ title, confirm, back }) {
  const [name, setName] = useState(loadName);
  const [focused, setFocused] = useState(false);
  const ready = cleanName(name) !== "";

  useEffect(() => {
    function handleMenuInput(input, repeat) {
      // Ignore auto-repeat from a held key
      if (repeat) return;
      if (input === "confirm") submit(name, confirm);
      if (input === "back") back();
    }

    return listenForMenuInput(handleMenuInput);
  }, [name, confirm, back]);

  // The caret stays at the end where the _ is drawn
  // Backspace fixes mistakes
  function keepCaretAtEnd(event) {
    const field = event.target;
    const end = field.value.length;
    if (field.selectionStart !== end || field.selectionEnd !== end) {
      field.setSelectionRange(end, end);
    }
  }

  return (
    <div className="stack menu menu-name">
      <div>{title}</div>
      <div>YOUR NAME:</div>
      <div className="name-field">
        <input
          value={name}
          maxLength={NAME_LENGTH}
          autoFocus
          autoComplete="nickname"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="done"
          aria-label="Your name"
          onChange={(event) => setName(typedName(event.target.value))}
          onSelect={keepCaretAtEnd}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {
          // Our own blinking _ in place of the browser's caret
          // A hidden copy of the name pushes it right after the last letter
          focused && (
            <div className="name-caret" aria-hidden="true">
              <span>{name}</span>
              <span className="caret">_</span>
            </div>
          )
        }
      </div>
      <div
        className={ready ? "menu-option selected" : "menu-option disabled"}
        onClick={() => submit(name, confirm)}
      >
        OK
      </div>
    </div>
  );
}

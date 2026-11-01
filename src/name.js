// Player name for 2P shown in the opponent's card
// 1 to 12 letters, digits, spaces, underscores or dashes
// The font has a glyph for each of them
// 12 fits the name field and keeps names short enough to read
export const NAME_LENGTH = 12;

// Name as it's saved and sent
// "" when nothing is left
// Checked on both sides: our own field and the name the opponent sends
// \w without the u flag is ASCII only
// So no accented letters
// Spaces are trimmed and runs of them become one
export function cleanName(text) {
  // Storage and the network can give anything
  if (typeof text !== "string") return "";

  return text
    .replace(/[^\w -]/g, "")
    .replace(/ +/g, " ")
    .trim()
    .slice(0, NAME_LENGTH)
    .trimEnd();
}

// Saved once entered and prefilled next time
// Storage can throw (private window, blocked site data)
// The name is then asked again on every visit
const STORAGE_KEY = "blocks:name";

// Cleaned again since storage can be edited by hand
export function loadName() {
  try {
    return cleanName(localStorage.getItem(STORAGE_KEY));
  } catch {
    return "";
  }
}

export function saveName(name) {
  try {
    localStorage.setItem(STORAGE_KEY, cleanName(name));
  } catch {
    // Not kept but the name still works for this match
  }
}

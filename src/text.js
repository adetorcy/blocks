import glyphs from "./fonts/Blocks6px.txt?raw";

// Advance of each character in font pixels
// The width of its glyph rows in the font source
const ADVANCES = Object.fromEntries(
  [...glyphs.matchAll(/^\[(.)\]\n([.#]+)$/gm)].map(([, char, row]) => [
    char,
    row.length,
  ]),
);

// One font pixel at the game's 24px text
const PIXEL = 4;

// Middle of the game area
const CENTER = 312;

// Left edge of a line centered on the game area, for text only known at runtime
// Same rule as the set labels in style.css
// Centered on its ink (the last spacing column left out)
// Then rounded up and left to the 4px grid
export function centeredLeft(text) {
  let advance = 0;
  for (const char of text) advance += ADVANCES[char] ?? 0;
  const ink = (advance - 1) * PIXEL;
  return Math.floor((CENTER - ink / 2) / PIXEL) * PIXEL;
}

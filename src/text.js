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

// Left edge of a line centered on the game area
// For text only known at runtime, and About's lines
// Or centered on another middle, like a window's
// Same rule as the set labels in style.css
// Centered on its ink (the last spacing column left out)
// Then rounded up and left to the 4px grid
export function centeredLeft(text, center = CENTER) {
  let advance = 0;
  for (const char of text) advance += ADVANCES[char] ?? 0;
  const ink = (advance - 1) * PIXEL;
  return Math.floor((center - ink / 2) / PIXEL) * PIXEL;
}

// Lines of text filled to a width in px, cut anywhere
// For the join link, which has no spaces to break at
// Each line's ink fits the width
export function filledLines(text, width) {
  const lines = [];
  let line = "";
  let advance = 0;
  for (const char of text) {
    const next = advance + (ADVANCES[char] ?? 0);
    if (line && (next - 1) * PIXEL > width) {
      lines.push(line);
      line = char;
      advance = ADVANCES[char] ?? 0;
    } else {
      line += char;
      advance = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

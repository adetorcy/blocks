/***

https://tetris.wiki/Tetris_Guideline

Starting with the official Guideline hues
Lightness and chroma are tuned in OKLCH where lightness matches perceived brightness
Blue is lighter to stand out on the dark page
Yellow, cyan and green are toned down so they don't glare
Some lightness gap is kept between S/Z/L and J/T for colorblind players

***/

export const CYAN = "oklch(0.86 0.14 195)";
export const YELLOW = "oklch(0.91 0.18 110)";
export const BLUE = "oklch(0.62 0.19 264)";
export const ORANGE = "oklch(0.79 0.17 71)";
export const GREEN = "oklch(0.82 0.21 142)";
export const MAGENTA = "oklch(0.70 0.22 328)";
export const RED = "oklch(0.66 0.21 29)";

// Block highlights and the lock flash, --white in style.css too
export const WHITE = "oklch(0.9 0 0)";

// Jammed piece at game over, --gray in style.css too
export const GRAY = "DarkGray";

// More card border colors, halfway between two piece colors
// Hue and lightness in between, chroma capped to stay in sRGB
// The warm gaps are tight, so coral, lime and gold sit close to their neighbors
const ROSE = "oklch(0.68 0.21 358)";
const TEAL = "oklch(0.84 0.16 168)";
const CORAL = "oklch(0.73 0.17 50)";
const VIOLET = "oklch(0.66 0.2 296)";
const LIME = "oklch(0.86 0.2 126)";
const AZURE = "oklch(0.74 0.14 230)";
const GOLD = "oklch(0.85 0.17 90)";

// Card borders from level 1 on: the piece colors in piece order I, S, T, L, O, Z, J
// then the in-between colors, each far around the wheel from the one before
// Level 0 is white, level 15 is back to cyan
export const LEVEL_COLORS = [
  CYAN,
  GREEN,
  MAGENTA,
  ORANGE,
  YELLOW,
  RED,
  BLUE,
  ROSE,
  TEAL,
  CORAL,
  VIOLET,
  LIME,
  AZURE,
  GOLD,
];

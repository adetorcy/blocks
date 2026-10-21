// Builds src/fonts/Blocks6px.ttf from the pixel glyphs in src/fonts/Blocks6px.txt
// Run with npm run font, then commit both files
// Same source, same file: no timestamps from the build

// TrueType reference
// https://learn.microsoft.com/en-us/typography/opentype/spec/

import { readFileSync, writeFileSync } from "node:fs";
import { Buffer } from "node:buffer";

const SOURCE = new URL("../src/fonts/Blocks6px.txt", import.meta.url);
const OUTPUT = new URL("../src/fonts/Blocks6px.ttf", import.meta.url);

// Font units per font pixel
// An em of 6 pixels, so a font pixel is exactly 4px at 24px
const PIXEL = 100;
const ASCENT = 5;
const DESCENT = 1;
const UNITS_PER_EM = (ASCENT + DESCENT) * PIXEL;

const NAMES = {
  0: "Copyright 2024 Antoine de Torcy",
  1: "Blocks",
  2: "Regular",
  3: "1.000;NONE;Blocks-Regular",
  4: "Blocks Regular",
  5: "Version 1.000",
  6: "Blocks-Regular",
  9: "Antoine de Torcy",
  13: "MIT License",
  14: "https://github.com/adetorcy/blocks/blob/main/LICENSE",
};

// Date the glyphs were drawn (first commit of the font)
const CREATED = Date.UTC(2024, 8, 12);

/**
 * Glyphs from the source file
 **/

// Each glyph: { char, rows } with rows top to bottom
function readGlyphs(text) {
  const glyphs = [];
  let glyph = null;
  for (const line of text.split("\n")) {
    if (line.startsWith("//")) continue;

    const header = line.match(/^\[(.)\]$/);
    if (header) {
      glyph = { char: header[1], rows: [] };
      glyphs.push(glyph);
    } else if (line) {
      glyph.rows.push(line);
    }
  }

  for (const { char, rows } of glyphs) {
    const width = rows[0].length;
    if (
      rows.length !== ASCENT + DESCENT ||
      rows.some((r) => r.length !== width)
    )
      throw new Error(
        `Glyph ${char} isn't ${ASCENT + DESCENT} rows of equal width`,
      );
  }
  return glyphs.sort((a, b) => a.char.charCodeAt(0) - b.char.charCodeAt(0));
}

// Outlines around the filled pixels, in font units
// Outer contours run clockwise, holes counterclockwise (TrueType convention)
// The filled side is always on the right, so at a corner where two pixels
// only touch diagonally the turn to the right keeps them apart
function trace(rows) {
  const filled = (col, row) => rows[row]?.[col] === "#";

  // Pixel edges with an empty pixel on the other side
  // y goes up from the baseline, row 0 is the top row
  const edges = [];
  rows.forEach((line, row) => {
    for (let col = 0; col < line.length; col++) {
      if (!filled(col, row)) continue;

      const [left, right, top, bottom] = [
        col,
        col + 1,
        ASCENT - row,
        ASCENT - row - 1,
      ];
      if (!filled(col, row - 1)) edges.push([left, top, right, top]);
      if (!filled(col + 1, row)) edges.push([right, top, right, bottom]);
      if (!filled(col, row + 1)) edges.push([right, bottom, left, bottom]);
      if (!filled(col - 1, row)) edges.push([left, bottom, left, top]);
    }
  });

  const starts = new Map();
  for (const edge of edges) {
    const key = `${edge[0]},${edge[1]}`;
    starts.set(key, [...(starts.get(key) || []), edge]);
  }

  // Next edge: right turn first, then straight, then left
  function next([x0, y0, x1, y1]) {
    const [dx, dy] = [x1 - x0, y1 - y0];
    const candidates = starts.get(`${x1},${y1}`);
    for (const [tx, ty] of [
      [dy, -dx],
      [dx, dy],
      [-dy, dx],
    ]) {
      const edge = candidates.find(
        (e) => e[2] - e[0] === tx && e[3] - e[1] === ty,
      );
      if (edge) return edge;
    }
  }

  const used = new Set();
  const contours = [];
  for (const first of edges) {
    if (used.has(first)) continue;

    const points = [];
    let edge = first;
    do {
      used.add(edge);
      points.push([edge[0], edge[1]]);
      edge = next(edge);
    } while (edge !== first);

    // Only corners, no points in the middle of a straight line
    const corners = points.filter((p, i) => {
      const [a, c] = [points.at(i - 1), points[(i + 1) % points.length]];
      return (p[0] - a[0]) * (c[1] - p[1]) !== (p[1] - a[1]) * (c[0] - p[0]);
    });
    contours.push(corners.map(([x, y]) => [x * PIXEL, y * PIXEL]));
  }
  return contours;
}

/**
 * Binary helpers
 **/

class Writer {
  constructor() {
    this.bytes = [];
  }
  u8(...values) {
    for (const v of values) this.bytes.push(v & 0xff);
    return this;
  }
  u16(...values) {
    for (const v of values) this.u8(v >> 8, v);
    return this;
  }
  u32(...values) {
    for (const v of values) this.u16(v >>> 16, v);
    return this;
  }
  tag(text) {
    return this.u8(...Buffer.from(text, "latin1"));
  }
  get buffer() {
    return Buffer.from(this.bytes);
  }
}

// 32-bit sum of a table, padded to a multiple of 4
function checksum(buffer) {
  const padded = Buffer.concat([
    buffer,
    Buffer.alloc((4 - (buffer.length % 4)) % 4),
  ]);
  let sum = 0;
  for (let i = 0; i < padded.length; i += 4)
    sum = (sum + padded.readUInt32BE(i)) >>> 0;
  return sum;
}

// Seconds since 1904-01-01, as 2 halves
function longDateTime(ms) {
  const seconds = ms / 1000 + 2082844800;
  return [Math.floor(seconds / 2 ** 32), seconds % 2 ** 32];
}

/**
 * Tables
 **/

function encodeGlyph(contours) {
  const points = contours.flat();
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const w = new Writer().u16(contours.length);
  w.u16(Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys));

  let end = -1;
  for (const contour of contours) w.u16((end += contour.length));

  // No instructions
  w.u16(0);

  // Coordinates as deltas from the previous point, 1 byte when they fit
  // Flag bits: 1 on curve, 2 and 4 short x and y, 16 and 32 same or positive x and y
  const deltas = points.map(([x, y], i) => {
    const [px, py] = i ? points[i - 1] : [0, 0];
    return [x - px, y - py];
  });
  const flags = deltas.map(([dx, dy]) => {
    let flag = 1;
    if (dx === 0) flag |= 16;
    else if (Math.abs(dx) < 256) flag |= 2 | (dx > 0 ? 16 : 0);
    if (dy === 0) flag |= 32;
    else if (Math.abs(dy) < 256) flag |= 4 | (dy > 0 ? 32 : 0);
    return flag;
  });
  w.u8(...flags);
  deltas.forEach(([dx], i) => {
    if (flags[i] & 2) w.u8(Math.abs(dx));
    else if (dx !== 0) w.u16(dx);
  });
  deltas.forEach(([, dy], i) => {
    if (flags[i] & 4) w.u8(Math.abs(dy));
    else if (dy !== 0) w.u16(dy);
  });
  return w.buffer;
}

// Format 4 subtable, one segment per run of consecutive chars
function cmapTable(codes) {
  const segments = [];
  codes.forEach((code, i) => {
    const glyphId = i + 1;
    const last = segments.at(-1);
    if (last && code === last.end + 1) last.end = code;
    else segments.push({ start: code, end: code, delta: glyphId - code });
  });
  segments.push({ start: 0xffff, end: 0xffff, delta: 1 });

  const count = segments.length;
  const searchRange = 2 ** Math.floor(Math.log2(count)) * 2;
  const sub = new Writer().u16(4, 16 + 8 * count, 0);
  sub.u16(
    2 * count,
    searchRange,
    Math.log2(searchRange / 2),
    2 * count - searchRange,
  );
  sub.u16(...segments.map((s) => s.end), 0);
  sub.u16(...segments.map((s) => s.start));
  sub.u16(...segments.map((s) => s.delta));
  sub.u16(...segments.map(() => 0));

  // Unicode and Windows platforms share the subtable
  return new Writer()
    .u16(0, 2)
    .u16(0, 3)
    .u32(20)
    .u16(3, 1)
    .u32(20)
    .u8(...sub.buffer).buffer;
}

function nameTable() {
  const records = Object.entries(NAMES).map(([id, text]) => ({
    id: Number(id),
    data: Buffer.from(text, "utf16le").swap16(),
  }));
  const w = new Writer().u16(0, records.length, 6 + 12 * records.length);
  let offset = 0;
  for (const { id, data } of records) {
    w.u16(3, 1, 0x409, id, data.length, offset);
    offset += data.length;
  }
  for (const { data } of records) w.u8(...data);
  return w.buffer;
}

// Directory then tables, each 4-byte aligned, sorted by tag
function assemble(tables) {
  const tags = Object.keys(tables).sort();
  const searchRange = 2 ** Math.floor(Math.log2(tags.length)) * 16;
  const header = new Writer().u32(0x00010000).u16(tags.length, searchRange);
  header.u16(Math.log2(searchRange / 16), tags.length * 16 - searchRange);

  let offset = 12 + 16 * tags.length;
  const bodies = [];
  for (const tag of tags) {
    const data = tables[tag];
    header.tag(tag).u32(checksum(data), offset, data.length);
    const padded = Buffer.concat([
      data,
      Buffer.alloc((4 - (data.length % 4)) % 4),
    ]);
    bodies.push(padded);
    offset += padded.length;
  }

  // Whole file checksum goes in head, offset 8
  const font = Buffer.concat([header.buffer, ...bodies]);
  const headOffset = font.readUInt32BE(12 + 16 * tags.indexOf("head") + 8);
  font.writeUInt32BE((0xb1b0afba - checksum(font)) >>> 0, headOffset + 8);
  return font;
}

/**
 * Build
 **/

const glyphs = readGlyphs(readFileSync(SOURCE, "utf8"));

// Glyph 0 (.notdef) is a hollow box, shown for chars the font doesn't have
const notdef = {
  char: null,
  rows: ["###.", "#.#.", "#.#.", "#.#.", "###.", "...."],
};

const all = [notdef, ...glyphs].map(({ char, rows }) => {
  const contours = trace(rows);
  const xs = contours.flat().map(([x]) => x);
  const ys = contours.flat().map(([, y]) => y);
  return {
    char,
    contours,
    advance: rows[0].length * PIXEL,
    xMin: xs.length ? Math.min(...xs) : 0,
    xMax: xs.length ? Math.max(...xs) : 0,
    yMin: ys.length ? Math.min(...ys) : 0,
    yMax: ys.length ? Math.max(...ys) : 0,
    data: contours.length ? encodeGlyph(contours) : Buffer.alloc(0),
  };
});
const inked = all.filter((g) => g.contours.length);
const codes = glyphs.map((g) => g.char.charCodeAt(0));
const max = (values) => Math.max(...values);
const min = (values) => Math.min(...values);

// Glyph data, long offsets
const loca = new Writer();
const glyf = [];
let glyfLength = 0;
for (const { data } of all) {
  loca.u32(glyfLength);
  const padded = Buffer.concat([
    data,
    Buffer.alloc((4 - (data.length % 4)) % 4),
  ]);
  glyf.push(padded);
  glyfLength += padded.length;
}
loca.u32(glyfLength);

const bbox = [min(inked.map((g) => g.xMin)), min(inked.map((g) => g.yMin))];
bbox.push(max(inked.map((g) => g.xMax)), max(inked.map((g) => g.yMax)));

// Cap height and x-height measured on the glyphs
const capHeight = all.find((g) => g.char === "H").yMax;
const xHeight = all.find((g) => g.char === "x").yMax;
const ascender = ASCENT * PIXEL;
const descender = -DESCENT * PIXEL;

const head = new Writer().u32(0x00010000, 0x00010000, 0, 0x5f0f3cf5);
// Flags: baseline at y 0, left sidebearing at x 0, integer ppem
head.u16(0b1011, UNITS_PER_EM);
head.u32(...longDateTime(CREATED), ...longDateTime(CREATED));
head.u16(...bbox, 0, ASCENT + DESCENT, 2, 1, 0);

const hhea = new Writer().u32(0x00010000).u16(ascender, descender, 0);
hhea.u16(max(all.map((g) => g.advance)), min(inked.map((g) => g.xMin)));
hhea.u16(
  min(inked.map((g) => g.advance - g.xMax)),
  max(inked.map((g) => g.xMax)),
);
hhea.u16(1, 0, 0, 0, 0, 0, 0, 0, all.length);

const maxp = new Writer().u32(0x00010000).u16(all.length);
maxp.u16(max(inked.map((g) => g.contours.flat().length)));
maxp.u16(max(inked.map((g) => g.contours.length)));
maxp.u16(0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0);

const hmtx = new Writer();
for (const g of all) hmtx.u16(g.advance, g.xMin);

const advances = all.map((g) => g.advance).filter(Boolean);
const os2 = new Writer().u16(4);
os2.u16(Math.round(advances.reduce((a, b) => a + b) / advances.length));
// Regular weight and width, installable
os2.u16(400, 5, 0);
// Sub and superscripts, strikeout on the middle row
os2.u16(400, 400, 0, 100, 400, 400, 0, 300, PIXEL, 3 * PIXEL, 0);
os2.u8(...Array(10).fill(0));
// Basic Latin
os2.u32(1, 0, 0, 0).tag("NONE");
// Regular, use typo metrics
os2.u16(0b11000000, min(codes), max(codes));
os2.u16(ascender, descender, 0, ascender, -descender);
// Latin 1 code page
os2.u32(1, 0);
os2.u16(xHeight, capHeight, 0, 32, 0);

// Format 3, no glyph names
// Underline on the descender row
const post = new Writer().u32(0x00030000, 0).u16(0, PIXEL).u32(0, 0, 0, 0, 0);

const font = assemble({
  "OS/2": os2.buffer,
  cmap: cmapTable(codes),
  glyf: Buffer.concat(glyf),
  head: head.buffer,
  hhea: hhea.buffer,
  hmtx: hmtx.buffer,
  loca: loca.buffer,
  maxp: maxp.buffer,
  name: nameTable(),
  post: post.buffer,
});
writeFileSync(OUTPUT, font);
console.log(`${glyphs.length} glyphs, ${font.length} bytes`);

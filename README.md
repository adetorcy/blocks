# blocks

[Play it live](https://adetorcy.github.io/blocks/)

Tetris clone for the browser, mostly based on the NES version

## NES rules (NTSC)

- 60 game frames per second (a faster display doesn't speed up the game)
- Gravity: from 48 frames per row at level 0 to 1 frame per row at level 29
- Right-handed Nintendo Rotation System
- Entry delay (ARE): 10 to 18 frames depending on how high the piece locks
- Randomizer: one reroll on repeats, no 7-piece bag (droughts can happen)
- Scoring: 40 / 100 / 300 / 1200 × (level + 1)
- Level up every 10 lines

## Changes

- Faster DAS: 15 frames then a shift every 2 (NES: 16 then every 6)
- Soft drop at 1/3 G like the Game Boy (NES: 1/2 G)
- No pushdown points
- A-type game only, start at level 0

## Additions

- Hard drop
- Ghost piece

## Controls

- Keyboard (arrows or WASD)
- Touch buttons

## Built with

- Vite, React (UI) and plain JavaScript (game)
- Canvas, Web Audio API
- Claude Code from version 0.4.0 onward

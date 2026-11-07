# blocks

[Try it](https://adetorcy.github.io/blocks/)

Old-school Tetris remake for the browser. Loosely based on the NES version.

Serverless 2 player mode is built on top of [Trystero](https://github.com/dmotz/trystero). See [src/transport.js](src/transport.js).


## Game Specs

- 60 game frames per second (display FPS can be higher)
- Well: 10x22 with the top 2 rows hidden
- Right-handed Nintendo Rotation System
- NES gravity table (NTSC)
- NES Randomizer
- DAS: 15 frames then a shift every 2 frames
- Spawn delay: 10 to 18 frames
- Soft drop speed: 1 row every 3 frames
- Nintendo scoring system (without pushdown points)
- Hard drop
- Ghost piece

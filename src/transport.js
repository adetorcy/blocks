import { version } from "../package.json";

/**
 * 2P connection to the opponent
 *
 * Trystero underneath: WebRTC with public Nostr relays to meet
 * No server of our own
 * Only this module imports Trystero
 * Trystero loads on the first 2P game (dynamic import) so 1P never downloads it
 *
 * https://github.com/dmotz/trystero
 **/

// Rooms only meet rooms with the same app ID
// Dev has its own (.env.development) so test rooms never meet real players
const APP_ID = import.meta.env.VITE_APP_ID;

// Joiner gives up when nobody answers in that time
// Joins took 0.3 to 5s in the spike
const JOIN_TIMEOUT = 30000;

// Heartbeat so silence means something
const BEAT_INTERVAL = 1000;

// Opponent counts as silent past this
// Trystero's own leave took 10 to 77s in the spike
// That's too slow for a match
// A network change pauses messages for about 3s
// So silence doesn't mean they left
const SILENCE_TIMEOUT = 3000;

// Largest message we accept
// Trystero drops anything bigger
// A board is 220 cells or about 500 bytes as JSON
const MAX_MESSAGE_BYTES = 4096;

/**
 * Room link
 **/

// Random ID of bytes * 8 bits in URL-safe base64
function randomId(bytes) {
  const values = crypto.getRandomValues(new Uint8Array(bytes));
  return btoa(String.fromCharCode(...values))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Room ID 72 bits and password 128 bits
// Base64 gives 12 and 22 characters
const ROOM_ID = /^[\w-]{12}$/;
const PASSWORD = /^[\w-]{22}$/;

// A new room for the player creating the game
export function newRoom() {
  return { roomId: randomId(9), password: randomId(16) };
}

// Link to share with the opponent
// Room ID and password go in the # fragment
// Browsers never send the fragment to the server
export function roomLink(room, href) {
  const link = new URL(href);
  link.hash = new URLSearchParams({
    r: room.roomId,
    p: room.password,
  }).toString();
  return link.href;
}

// Room from a link's # fragment (location.hash) or null
// Anything typed or cut short gives null
export function readRoomLink(hash) {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const roomId = params.get("r") ?? "";
  const password = params.get("p") ?? "";
  if (!ROOM_ID.test(roomId) || !PASSWORD.test(password)) return null;
  return { roomId, password };
}

/**
 * Messages
 **/

// Game messages are plain objects with a string type
// Each message type checks the rest where it's handled
export function isMessage(data) {
  return (
    typeof data === "object" &&
    data !== null &&
    !Array.isArray(data) &&
    typeof data.type === "string"
  );
}

// Why a join failed from Trystero's error text
// Our own handshake throws "full" or "version"
function joinErrorReason(error) {
  if (error === "full" || error === "version") return error;
  if (error.includes("password")) return "password";
  return "failed";
}

/**
 * Connection
 **/

// Joins the room and calls back
//   onOpen() once the opponent is connected
//   onMessage(message) for each game message from them
//   onSilence(silent) when they go silent and when they're heard again
//   onError(reason) if joining fails: full, version, password, timeout or failed
// The creator only gets failed (Trystero didn't load)
// Other join errors are the joiner's and the creator keeps waiting
// Returns { send, leave } right away
// Trystero loads in the background
export function connect(
  room,
  { joining, onOpen, onMessage, onSilence, onError },
) {
  // Opponent's peer ID: the first one through the handshake
  // Kept when they drop so they can come back
  let opponent = null;

  let trysteroRoom = null;
  let sendGame = null;
  let sendBeat = null;
  let lastHeard = 0;
  let silent = false;
  let left = false;
  let failed = false;
  let beatTimer = null;
  let joinTimer = null;

  // Only once and never after the opponent is in
  function fail(reason) {
    if (failed || opponent) return;
    failed = true;
    leave();
    onError(reason);
  }

  // A send fails when the connection drops
  // Silence already covers that
  function dropped() {}

  function heard() {
    lastHeard = performance.now();
    if (silent) {
      silent = false;
      onSilence(false);
    }
  }

  // Send a heartbeat and check for silence
  function beat() {
    sendBeat(0, { target: opponent }).catch(dropped);
    if (!silent && performance.now() - lastHeard > SILENCE_TIMEOUT) {
      silent = true;
      onSilence(true);
    }
  }

  // Both sides send their version and whether they're full
  // Then each checks the other's
  // Thrown errors end up in onJoinError on that side
  async function handshake(peerId, send, receive) {
    // Two players only
    // The same opponent can come back after a drop
    const full = opponent !== null && opponent !== peerId;
    await send({ version, full });
    if (full) throw new Error("full");

    const { data } = await receive();
    if (data?.full) throw new Error("full");
    if (data?.version !== version) throw new Error("version");
  }

  function join({ joinRoom }) {
    if (left) return;

    trysteroRoom = joinRoom(
      {
        appId: APP_ID,
        password: room.password,
        maxReceiveBytes: MAX_MESSAGE_BYTES,
      },
      room.roomId,
      {
        onPeerHandshake: handshake,
        onJoinError: ({ error }) => {
          if (joining) fail(joinErrorReason(error));
        },
      },
    );

    const game = trysteroRoom.makeAction("game");
    const beatAction = trysteroRoom.makeAction("beat");
    sendGame = game.send;
    sendBeat = beatAction.send;

    // Only the opponent's messages count
    game.onMessage = (data, { peerId }) => {
      if (peerId !== opponent) return;
      heard();
      if (isMessage(data)) onMessage(data);
    };

    beatAction.onMessage = (data, { peerId }) => {
      if (peerId === opponent) heard();
    };

    trysteroRoom.onPeerJoin = (peerId) => {
      // Back after a drop
      // Silence ends with their next message
      if (peerId === opponent) return;
      // A third peer that slipped through the handshake at the same time
      if (opponent) return;

      opponent = peerId;
      clearTimeout(joinTimer);
      lastHeard = performance.now();
      beatTimer = setInterval(beat, BEAT_INTERVAL);
      onOpen();
    };

    if (joining) {
      joinTimer = setTimeout(() => fail("timeout"), JOIN_TIMEOUT);
    }
  }

  function send(message) {
    if (opponent && !left) {
      sendGame(message, { target: opponent }).catch(dropped);
    }
  }

  function leave() {
    if (left) return;
    left = true;
    clearInterval(beatTimer);
    clearTimeout(joinTimer);
    trysteroRoom?.leave();
  }

  // Offline or the chunk failed to load
  import("trystero").then(join, () => fail("failed"));

  return { send, leave };
}

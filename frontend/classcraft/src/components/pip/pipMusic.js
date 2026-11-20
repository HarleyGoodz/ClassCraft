/*
 * pipMusic.js: Pip's background music.
 * Purpose: plays a looping chiptune while Pip is on screen (opened or talking).
 * What it does: builds the tune with the Web Audio API, so no audio file is needed.
 * startPipMusic() starts the music and returns a stop function. The music keeps playing
 * while at least one Pip is showing and fades out when the last one closes.
 * Browsers only allow sound after the user has clicked, tapped or typed on the page, so if
 * that hasn't happened yet the music starts on the next click, tap or key press.
 * The music pauses while the browser tab is hidden and resumes when the tab comes back.
 */

// The same tune as Pip's 3D dance page: a square-wave melody, triangle bass and a soft kick drum.
const BPM = 112;
const STEP = 60 / BPM / 2; // one eighth note, in seconds
const VOLUME = 0.6; // overall loudness (0 to 1)
const FADE_IN = 1.2;
const FADE_OUT = 0.5;

// 32 eighth notes (4 bars). null = rest.
// prettier-ignore
const MELODY = [
  72, 76, 79, 76, 74, 77, 81, 77, 72, 76, 79, 84, 83, 79, 76, 74,
  72, 76, 79, 76, 77, 81, 84, 81, 79, 76, 74, 71, 72, null, 72, null,
];
// One bass note per beat (16 beats), played with a kick drum.
const BASS = [48, 48, 53, 53, 48, 48, 55, 55, 48, 48, 53, 53, 55, 55, 48, 48];

const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

let ctx = null;
let master = null;
let timer = null;
let nextStep = 0;
let startAt = 0;
let users = 0;
let stopTimer = null;
let pauseTimer = null;
let listenersAdded = false;

function ensureContext() {
  if (ctx) return ctx;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  ctx = new AudioCtx();
  master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);
  return ctx;
}

function note(time, midi, length, type, volume) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = mtof(midi);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(volume, time + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + length);
  osc.connect(gain);
  gain.connect(master);
  osc.start(time);
  osc.stop(time + length + 0.03);
}

function kick(time) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.setValueAtTime(150, time);
  osc.frequency.exponentialRampToValueAtTime(45, time + 0.12);
  gain.gain.setValueAtTime(0.45, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
  osc.connect(gain);
  gain.connect(master);
  osc.start(time);
  osc.stop(time + 0.16);
}

function playStep(step, time) {
  const i = step % 32;
  if (MELODY[i]) note(time, MELODY[i], STEP * 0.9, "square", 0.04);
  if (i % 2 === 0) {
    note(time, BASS[i / 2], STEP * 1.8, "triangle", 0.15);
    kick(time);
  }
}

function schedule() {
  // Queue notes a little ahead of time so they play on beat even if the page is busy.
  while (startAt + nextStep * STEP < ctx.currentTime + 0.2) {
    playStep(nextStep, startAt + nextStep * STEP);
    nextStep++;
  }
}

function rampVolume(target, seconds) {
  const now = ctx.currentTime;
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(master.gain.value, now);
  master.gain.linearRampToValueAtTime(target, now + seconds);
}

function resume() {
  if (!ctx || users === 0 || document.hidden) return;
  if (ctx.state !== "running") ctx.resume().catch(() => {});
}

function onUserGesture() {
  // Called inside the click/tap/key handler, which is what browsers require to allow sound.
  resume();
}

function onVisibilityChange() {
  if (!ctx) return;
  if (document.hidden) ctx.suspend().catch(() => {});
  else resume();
}

function addListeners() {
  if (listenersAdded) return;
  listenersAdded = true;
  ["pointerdown", "keydown", "touchend"].forEach((type) =>
    window.addEventListener(type, onUserGesture, { capture: true, passive: true }));
  document.addEventListener("visibilitychange", onVisibilityChange);
}

function play() {
  if (!ensureContext()) return;
  addListeners();
  clearTimeout(pauseTimer);
  if (timer === null) {
    startAt = ctx.currentTime + 0.05;
    nextStep = 0;
    schedule();
    timer = setInterval(schedule, 50);
  }
  rampVolume(VOLUME, FADE_IN);
  resume();
}

function fadeOutAndPause() {
  if (!ctx || users > 0) return;
  rampVolume(0, FADE_OUT);
  pauseTimer = setTimeout(() => {
    if (users > 0) return;
    clearInterval(timer);
    timer = null;
    ctx.suspend().catch(() => {});
  }, FADE_OUT * 1000 + 50);
}

/**
 * Starts Pip's background music. Call it when Pip appears and call the returned
 * function when Pip goes away. Safe to call from several components at once.
 */
export function startPipMusic() {
  users++;
  clearTimeout(stopTimer);
  try {
    play();
  } catch (error) {
    console.warn("Pip's music could not start:", error);
  }
  let stopped = false;
  return function stopPipMusic() {
    if (stopped) return;
    stopped = true;
    users = Math.max(0, users - 1);
    // A short delay keeps the music going if Pip is re-shown right away
    // (for example React StrictMode mounting the component twice in development).
    if (users === 0) stopTimer = setTimeout(fadeOutAndPause, 300);
  };
}
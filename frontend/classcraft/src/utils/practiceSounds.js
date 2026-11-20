/*
 * practiceSounds.js: sound effects for the practice activities.
 * Purpose: gives students audio feedback while they build a diagram.
 * What it does: playDropTing(blockCount) plays a bell "ting" when a block is dropped into the
 * diagram; the more blocks are in the diagram, the higher the ting. playPartyPop() plays a
 * popper "pop" and a short happy chime when the answer is correct.
 * The sounds are made with the Web Audio API, so no audio files are needed.
 */

// Notes of a major pentatonic scale (in semitones), so every ting sounds good after the last one.
const SCALE = [0, 2, 4, 7, 9];
const BASE_FREQ = 784; // G5: the first ting
const MAX_SEMITONES = 24; // stops rising after two octaves so it never gets shrill

let ctx = null;

function audio() {
  try {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      ctx = new AudioCtx();
    }
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  } catch {
    return null;
  }
}

function bell(time, freq, volume, length) {
  // A bell is a main tone plus a quieter, higher overtone that fades faster.
  [[1, volume, length], [2.76, volume * 0.35, length * 0.45]].forEach(([ratio, vol, len]) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq * ratio;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(vol, time + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + len);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + len + 0.05);
  });
}

/**
 * Plays the "ting" for a block dropped into the diagram.
 * blockCount: how many blocks are in the diagram now, including the one just dropped.
 */
export function playDropTing(blockCount = 1) {
  if (!audio()) return;
  const step = Math.max(0, Math.floor(blockCount) - 1);
  const semitones = Math.min(SCALE[step % SCALE.length] + 12 * Math.floor(step / SCALE.length), MAX_SEMITONES);
  bell(ctx.currentTime, BASE_FREQ * Math.pow(2, semitones / 12), 0.18, 0.7);
}

/** Plays a party-popper "pop" followed by a short rising chime. */
export function playPartyPop() {
  if (!audio()) return;
  const now = ctx.currentTime;

  // The pop: a short burst of noise.
  const length = 0.15;
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * length), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 1400;
  band.Q.value = 0.8;
  const popGain = ctx.createGain();
  popGain.gain.setValueAtTime(0.5, now);
  popGain.gain.exponentialRampToValueAtTime(0.001, now + length);
  noise.connect(band);
  band.connect(popGain);
  popGain.connect(ctx.destination);
  noise.start(now);

  // The chime: C, E, G, high C.
  [1047, 1319, 1568, 2093].forEach((freq, i) => bell(now + 0.12 + i * 0.09, freq, 0.14, i === 3 ? 1.1 : 0.5));
}
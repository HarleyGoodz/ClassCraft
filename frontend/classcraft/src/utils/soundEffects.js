let audioContext;

function playTone(frequency, duration, volume) {
  const AudioContextClass = window.AudioContext;
  if (!AudioContextClass) return;

  audioContext ??= new AudioContextClass();
  const context = audioContext;
  const play = () => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + duration);
  };

  if (context.state === "suspended") {
    return context.resume().then(play).catch((error) => {
      console.warn("Could not play the interface sound:", error);
    });
  }

  play();
}

export function playHoverSound() {
  return playTone(660, 0.055, 0.025);
}

export function playClickSound() {
  return playTone(440, 0.09, 0.04);
}

/*
 * Voice-over: reads short interface text aloud with the browser's built-in
 * speech synthesis. Voices load asynchronously, so we pick one again when the
 * browser announces that its voice list changed.
 */
const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;
let preferredVoice = null;

function pickVoice() {
  if (!synth) return;
  const voices = synth.getVoices();
  preferredVoice =
    voices.find((voice) => voice.lang?.startsWith("en") && voice.localService) ??
    voices.find((voice) => voice.lang?.startsWith("en")) ??
    null;
}

if (synth) {
  pickVoice();
  synth.addEventListener?.("voiceschanged", pickVoice);
}

export function speak(text, { rate = 1, pitch = 1, volume = 0.8 } = {}) {
  if (!synth || !text) return;

  // Only one line at a time, so moving between tiles never stacks voices.
  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  if (preferredVoice) utterance.voice = preferredVoice;
  utterance.lang = preferredVoice?.lang ?? "en-US";
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = volume;
  synth.speak(utterance);
}

export function stopSpeaking() {
  synth?.cancel();
}
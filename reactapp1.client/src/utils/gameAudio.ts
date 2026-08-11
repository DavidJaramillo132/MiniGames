type AudioContextConstructor = new () => AudioContext;

let context: AudioContext | null = null;

function getContext() {
  if (context || typeof window === 'undefined') {
    return context;
  }

  try {
    const AudioContextClass = window.AudioContext ??
      (window as Window & { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext;
    context = AudioContextClass ? new AudioContextClass() : null;
  } catch {
    context = null;
  }

  return context;
}

export function prepareGameAudio() {
  try {
    const audioContext = getContext();
    if (audioContext?.state === 'suspended') {
      void audioContext.resume().catch(() => {});
    }
  } catch {
    // Audio must never interrupt a game action.
  }
}

function playTone(frequency: number, duration: number) {
  try {
    const audioContext = getContext();
    if (!audioContext || audioContext.state !== 'running') {
      return;
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.035, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + duration);
  } catch {
    // Audio must never interrupt a game action.
  }
}

export function playTicTacToeTone() {
  playTone(440, 0.09);
}

export function playMemoryTone() {
  playTone(587, 0.07);
}

export function playTriviaTone() {
  playTone(784, 0.1);
}

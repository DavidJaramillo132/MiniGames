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

export async function prepareGameAudio() {
  try {
    const audioContext = getContext();
    if (audioContext?.state === 'suspended') {
      await audioContext.resume();
    }
  } catch {
    // Audio must never interrupt a game action.
  }
}

function playTone(frequency: number, duration: number) {
  try {
    const audioContext = getContext();
    if (!audioContext || audioContext.state !== 'running') {
      if (import.meta.env.DEV) {
        console.debug('[audio] tone skipped', { frequency, duration, state: audioContext?.state ?? 'no-context' });
      }
      return;
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.14, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + duration);

    if (import.meta.env.DEV) {
      const counter = window as unknown as { __playHubToneCount?: number };
      counter.__playHubToneCount = (counter.__playHubToneCount ?? 0) + 1;
      console.debug('[audio] tone', { frequency, duration, state: audioContext.state, count: counter.__playHubToneCount });
    }
  } catch {
    // Audio must never interrupt a game action.
  }
}

export function playTicTacToeTone() {
  playTone(440, 0.12);
}

export function playMemoryTone() {
  playTone(587, 0.1);
}

export function playTriviaTone() {
  playTone(784, 0.14);
}

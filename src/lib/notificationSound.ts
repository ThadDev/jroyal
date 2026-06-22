/**
 * Plays a subtle notification chime using the Web Audio API.
 * Designed to respect browser autoplay policies (only plays from user-gestures
 * or after the first user interaction unlocks the AudioContext).
 */
export function playNotificationSound() {
  try {
    const AudioCtor =
      typeof window !== "undefined"
        ? window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        : null;
    if (!AudioCtor) return;

    const ctx = new AudioCtor();

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.18, ctx.currentTime);
    masterGain.connect(ctx.destination);

    // Two-tone soft chime (G5 then B5)
    const tones = [
      { freq: 784, start: 0,    dur: 0.25 },
      { freq: 988, start: 0.18, dur: 0.35 },
    ];

    tones.forEach(({ freq, start, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(masterGain);

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(1, ctx.currentTime + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);

      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur);
    });

    // Close context after sounds finish
    setTimeout(() => ctx.close(), 1000);
  } catch {
    // Silently ignore — autoplay policy or unsupported browser
  }
}

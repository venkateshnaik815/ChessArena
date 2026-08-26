/**
 * Sound manager using Web Audio API.
 * Generates synthesized sounds for chess events.
 */

type SoundType = 'move' | 'capture' | 'check' | 'castle' | 'gameEnd' | 'promote';

class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  private getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.ctx;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.3,
    delay = 0
  ) {
    if (!this.enabled) return;

    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime + delay);

      gain.gain.setValueAtTime(0, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + duration);
    } catch {
      // Silently ignore audio errors (e.g., autoplay policy)
    }
  }

  play(sound: SoundType) {
    switch (sound) {
      case 'move':
        this.playTone(440, 0.08, 'square', 0.15);
        break;

      case 'capture':
        this.playTone(220, 0.05, 'square', 0.25);
        this.playTone(180, 0.1, 'sawtooth', 0.2, 0.05);
        break;

      case 'check':
        this.playTone(660, 0.1, 'sine', 0.3);
        this.playTone(880, 0.15, 'sine', 0.25, 0.1);
        break;

      case 'castle':
        this.playTone(330, 0.08, 'square', 0.2);
        this.playTone(440, 0.08, 'square', 0.2, 0.1);
        break;

      case 'promote':
        this.playTone(523, 0.1, 'sine', 0.3);
        this.playTone(659, 0.1, 'sine', 0.3, 0.1);
        this.playTone(784, 0.2, 'sine', 0.3, 0.2);
        break;

      case 'gameEnd':
        this.playTone(392, 0.15, 'sine', 0.3);
        this.playTone(330, 0.15, 'sine', 0.3, 0.2);
        this.playTone(262, 0.4, 'sine', 0.3, 0.4);
        break;
    }
  }
}

// Export a singleton instance
export const soundManager = new SoundManager();

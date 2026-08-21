import { store } from '../../core/GameState';

export class SoundService {
  private static instance: SoundService;
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private isBgmPlaying: boolean = false;
  private bgmIntervalId: number | null = null;
  private currentBgmTheme: string = 'world_1';
  private activeVoicesCount: number = 0;
  private readonly MAX_CONCURRENT_VOICES: number = 8;
  private lastSoundTimes: Record<string, number> = {};

  private constructor() {
    // AudioContext lazily unlocked on first interaction
    const resumeOnInteraction = () => {
      this.initContext();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('pointerdown', resumeOnInteraction);
        window.removeEventListener('keydown', resumeOnInteraction);
        window.removeEventListener('touchstart', resumeOnInteraction);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('pointerdown', resumeOnInteraction);
      window.addEventListener('keydown', resumeOnInteraction);
      window.addEventListener('touchstart', resumeOnInteraction);

      // Background tab handling: suspend on hidden, resume on active
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          if (this.ctx && this.ctx.state === 'running') {
            this.ctx.suspend();
          }
        } else {
          if (this.ctx && this.ctx.state === 'suspended' && store.get().settings.soundEnabled) {
            this.ctx.resume();
          }
        }
      });
    }
  }

  public static getInstance(): SoundService {
    if (!SoundService.instance) {
      SoundService.instance = new SoundService();
    }
    return SoundService.instance;
  }

  private initContext(): void {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.sfxGain = this.ctx.createGain();
        this.musicGain = this.ctx.createGain();

        this.sfxGain.connect(this.masterGain);
        this.musicGain.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);

        this.updateVolumes();
      }
    }
  }

  public updateVolumes(): void {
    if (typeof window === 'undefined') return;
    const s = store.get().settings;
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(s.soundEnabled ? s.soundVolume : 0, this.ctx.currentTime);
    }
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(s.musicEnabled ? s.musicVolume * 0.35 : 0, this.ctx.currentTime);
    }
  }

  private checkCooldown(soundId: string, minIntervalMs: number): boolean {
    const now = Date.now();
    const last = this.lastSoundTimes[soundId] || 0;
    if (now - last < minIntervalMs) return false;
    this.lastSoundTimes[soundId] = now;
    return true;
  }

  private createSafeVoice(type: OscillatorType, freq: number, duration: number, gainPeak: number, sweepFreq?: number): void {
    this.initContext();
    if (!this.ctx || !this.sfxGain || !store.get().settings.soundEnabled) return;
    if (this.activeVoicesCount >= this.MAX_CONCURRENT_VOICES) return;

    try {
      this.activeVoicesCount++;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      if (sweepFreq) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(10, sweepFreq), now + duration);
      }

      gain.gain.setValueAtTime(gainPeak, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + duration);

      osc.onended = () => {
        this.activeVoicesCount = Math.max(0, this.activeVoicesCount - 1);
      };
    } catch {
      this.activeVoicesCount = Math.max(0, this.activeVoicesCount - 1);
    }
  }

  // --- Combat SFX ---

  public playSlash(): void {
    if (!this.checkCooldown('slash', 70)) return;
    this.createSafeVoice('sawtooth', 180, 0.09, 0.2, 40);
  }

  public playHeavySlash(): void {
    if (!this.checkCooldown('heavy_slash', 120)) return;
    this.createSafeVoice('sawtooth', 120, 0.16, 0.35, 30);
  }

  public playEnemyHit(): void {
    if (!this.checkCooldown('hit', 140)) return;
    this.createSafeVoice('triangle', 220, 0.08, 0.25, 60);
  }

  public playEnemyDeath(): void {
    if (!this.checkCooldown('death', 100)) return;
    this.createSafeVoice('square', 150, 0.18, 0.3, 30);
  }

  public playCrit(): void {
    if (!this.checkCooldown('crit', 90)) return;
    this.createSafeVoice('triangle', 600, 0.15, 0.45, 1200);
  }

  public playCoin(): void {
    if (!this.checkCooldown('coin', 60)) return;
    this.createSafeVoice('sine', 987.77, 0.08, 0.18, 1318.51); // B5 -> E6
  }

  public playClick(): void {
    if (!this.checkCooldown('click', 50)) return;
    this.createSafeVoice('sine', 440, 0.06, 0.25, 120);
  }

  public playTap(): void {
    if (!this.checkCooldown('tap', 50)) return;
    this.createSafeVoice('triangle', 800, 0.05, 0.1, 100);
  }

  public playBuy(): void {
    this.playUpgrade();
  }

  public playUpgrade(): void {
    if (!this.checkCooldown('upgrade', 120)) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.createSafeVoice('sine', freq, 0.12, 0.2);
      }, idx * 45);
    });
  }

  public playAscension(): void {
    const chords = [
      [261.63, 329.63, 392.00],
      [349.23, 440.00, 523.25],
      [392.00, 493.88, 587.33],
      [523.25, 659.25, 783.99, 1046.50]
    ];
    chords.forEach((chord, step) => {
      setTimeout(() => {
        chord.forEach(freq => this.createSafeVoice('sawtooth', freq, 0.35, 0.1));
      }, step * 160);
    });
  }

  public playSummon(): void {
    this.createSafeVoice('sine', 220, 0.6, 0.3, 880);
  }

  public playVictory(): void {
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.createSafeVoice('triangle', freq, 0.22, 0.22);
      }, idx * 75);
    });
  }

  public playDefeat(): void {
    const notes = [400, 350, 300, 220];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.createSafeVoice('sawtooth', freq, 0.25, 0.2);
      }, idx * 90);
    });
  }

  public playBossWarning(): void {
    this.createSafeVoice('square', 110, 0.65, 0.35, 55);
  }

  public playClaim(): void {
    const notes = [659.25, 880.00, 1046.50];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.createSafeVoice('sine', freq, 0.18, 0.18);
      }, idx * 70);
    });
  }

  public playReincarnation(): void {
    const celestialNotes = [220, 330, 440, 660, 880, 1320];
    celestialNotes.forEach((freq, idx) => {
      setTimeout(() => {
        this.createSafeVoice('sine', freq, 0.5, 0.25);
      }, idx * 100);
    });
  }

  // --- Procedural World Themes & Boss BGM ---

  public setWorldTheme(theme: string): void {
    if (this.currentBgmTheme === theme && this.isBgmPlaying) return;
    this.currentBgmTheme = theme;
    if (this.isBgmPlaying) {
      this.stopAmbientBgm();
      this.startAmbientBgm(theme);
    }
  }

  public startAmbientBgm(theme: string = this.currentBgmTheme): void {
    if (this.isBgmPlaying) this.stopAmbientBgm();
    this.initContext();
    if (!this.ctx || !this.musicGain) return;

    this.isBgmPlaying = true;
    this.currentBgmTheme = theme;

    let chords: number[][];
    let tempoMs = 4000;

    switch (theme) {
      case 'boss':
        chords = [
          [73.42, 110.00, 146.83], // D2 minor tension
          [65.41, 98.00, 130.81],  // C2 dark
          [55.00, 82.41, 110.00],  // A1 low drone
          [82.41, 123.47, 164.81]  // E2 power
        ];
        tempoMs = 2400;
        break;
      case 'world_2': // Sakura Empire (Asian Pentatonic Minor)
        chords = [
          [146.83, 220.00, 261.63],
          [164.81, 246.94, 293.66],
          [130.81, 196.00, 220.00],
          [110.00, 164.81, 196.00]
        ];
        tempoMs = 3800;
        break;
      case 'world_3': // Crimson Abyss (Heavy resonance)
        chords = [
          [87.31, 130.81, 174.61],
          [98.00, 146.83, 196.00],
          [73.42, 110.00, 146.83],
          [65.41, 98.00, 130.81]
        ];
        tempoMs = 3500;
        break;
      case 'world_4': // Frost Peaks (Ethereal crystal)
        chords = [
          [220.00, 329.63, 440.00],
          [246.94, 370.00, 493.88],
          [196.00, 293.66, 392.00],
          [164.81, 246.94, 329.63]
        ];
        tempoMs = 4200;
        break;
      case 'world_5': // Void Sanctuary (Cosmic depth)
        chords = [
          [65.41, 130.81, 196.00],
          [55.00, 110.00, 164.81],
          [73.42, 146.83, 220.00],
          [49.00, 98.00, 146.83]
        ];
        tempoMs = 4500;
        break;
      case 'world_1':
      default:
        chords = [
          [130.81, 196.00, 261.63],
          [146.83, 220.00, 293.66],
          [110.00, 164.81, 220.00],
          [174.61, 261.63, 349.23]
        ];
        tempoMs = 4000;
        break;
    }

    let currentChordIndex = 0;

    const playChordStep = () => {
      if (!this.isBgmPlaying || !this.ctx || !this.musicGain) return;
      if (!store.get().settings.musicEnabled) return;

      const chord = chords[currentChordIndex];
      currentChordIndex = (currentChordIndex + 1) % chords.length;

      chord.forEach((freq) => {
        try {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          const filter = this.ctx!.createBiquadFilter();

          osc.type = theme === 'boss' ? 'sawtooth' : 'sine';
          osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(theme === 'boss' ? 800 : 500, this.ctx!.currentTime);

          const duration = tempoMs / 1000;
          gain.gain.setValueAtTime(0.001, this.ctx!.currentTime);
          gain.gain.linearRampToValueAtTime(0.06, this.ctx!.currentTime + duration * 0.35);
          gain.gain.linearRampToValueAtTime(0.001, this.ctx!.currentTime + duration);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.musicGain!);

          osc.start();
          osc.stop(this.ctx!.currentTime + duration);
        } catch {}
      });
    };

    playChordStep();
    this.bgmIntervalId = window.setInterval(playChordStep, tempoMs);
  }

  public stopAmbientBgm(): void {
    this.isBgmPlaying = false;
    if (this.bgmIntervalId !== null) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
  }
}

export const sound = SoundService.getInstance();

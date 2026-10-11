// Studio-grade Web Audio API synthesized sound notifications
// Zero external asset dependencies — works reliably offline, in restricted sandboxes, and across all browsers
import { CompletionSoundTheme } from '../types/study';

export interface SoundThemeOption {
  id: CompletionSoundTheme;
  title: string;
  subtitle: string;
  badge: string;
}

export const SOUND_THEME_OPTIONS: SoundThemeOption[] = [
  {
    id: 'victory',
    title: 'لحن الانتصار والظفر',
    subtitle: 'صعود نغمي فخم ينتهي بكورد إنجاز ملكي دافئ يملؤك بالفخر والتحفيز',
    badge: 'الأقوى تحفيزاً ⭐',
  },
  {
    id: 'crystal',
    title: 'أجراس الإنجاز الماسية',
    subtitle: 'أجراس بلورية نقية وصافية مستوحاة من رنات النجاح المبهجة',
    badge: 'نقي ولامع ✨',
  },
  {
    id: 'celestial',
    title: 'أثير الإلهام الملكي',
    subtitle: 'هارموني دافئ وهادئ ينشر السكينة والفخر العميق بإتمام الجلسة',
    badge: 'عميق وملهم 🌌',
  },
  {
    id: 'energetic',
    title: 'نبض الطاقة والنشوة',
    subtitle: 'نغمة إلكترونية سريعة ومبهجة تمنحك شحنة دوبامين فورية للمواصلة',
    badge: 'حماسي ونشيط ⚡',
  },
];

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Creates a master output bus with mild studio compression to ensure warm, clipping-free playback.
 */
function createMasterBus(ctx: AudioContext): AudioNode {
  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.setValueAtTime(-12, ctx.currentTime);
  compressor.knee.setValueAtTime(12, ctx.currentTime);
  compressor.ratio.setValueAtTime(3.5, ctx.currentTime);
  compressor.attack.setValueAtTime(0.003, ctx.currentTime);
  compressor.release.setValueAtTime(0.2, ctx.currentTime);
  compressor.connect(ctx.destination);
  return compressor;
}

/**
 * Synthesizes an organic bell / chime voice with dual detuned oscillators and warm natural decay.
 */
function playBellVoice(
  ctx: AudioContext,
  destination: AudioNode,
  options: {
    freq: number;
    start: number;
    duration: number;
    gain: number;
    type?: OscillatorType;
    detuneCents?: number;
    sparkle?: boolean;
    warmth?: boolean;
  }
): void {
  const { freq, start, duration, gain, type = 'sine', detuneCents = 4, sparkle = false, warmth = false } = options;
  const now = ctx.currentTime;
  const noteStartTime = now + start;
  const noteEndTime = noteStartTime + duration;

  // Primary fundamental oscillator
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = type;
  osc1.frequency.setValueAtTime(freq, noteStartTime);

  // Slight detuning for rich natural acoustic chorus
  if (detuneCents !== 0) {
    osc1.detune.setValueAtTime(detuneCents, noteStartTime);
  }

  // Attack and decay envelope
  gain1.gain.setValueAtTime(0.0001, noteStartTime);
  gain1.gain.linearRampToValueAtTime(gain, noteStartTime + 0.015);
  gain1.gain.exponentialRampToValueAtTime(0.0001, noteEndTime);

  osc1.connect(gain1);
  gain1.connect(destination);

  osc1.start(noteStartTime);
  osc1.stop(noteEndTime + 0.05);

  // Warmth layer: sub-octave or warm unison
  if (warmth) {
    const oscWarm = ctx.createOscillator();
    const gainWarm = ctx.createGain();
    oscWarm.type = 'triangle';
    oscWarm.frequency.setValueAtTime(freq * 0.5, noteStartTime);

    gainWarm.gain.setValueAtTime(0.0001, noteStartTime);
    gainWarm.gain.linearRampToValueAtTime(gain * 0.35, noteStartTime + 0.02);
    gainWarm.gain.exponentialRampToValueAtTime(0.0001, noteStartTime + duration * 0.8);

    oscWarm.connect(gainWarm);
    gainWarm.connect(destination);

    oscWarm.start(noteStartTime);
    oscWarm.stop(noteEndTime);
  }

  // Sparkle layer: crystalline overtone (bell harmonic at 2x or 3x frequency)
  if (sparkle) {
    const oscSparkle = ctx.createOscillator();
    const gainSparkle = ctx.createGain();
    oscSparkle.type = 'sine';
    oscSparkle.frequency.setValueAtTime(freq * 2.756, noteStartTime); // Non-integer bell overtone

    gainSparkle.gain.setValueAtTime(0.0001, noteStartTime);
    gainSparkle.gain.linearRampToValueAtTime(gain * 0.22, noteStartTime + 0.008);
    gainSparkle.gain.exponentialRampToValueAtTime(0.0001, noteStartTime + duration * 0.45);

    oscSparkle.connect(gainSparkle);
    gainSparkle.connect(destination);

    oscSparkle.start(noteStartTime);
    oscSparkle.stop(noteStartTime + duration * 0.5);
  }
}

/**
 * 1. "لحن الانتصار والظفر" (Legendary Fanfare & Victory Chime)
 * An uplifting, majestic ascending arpeggio culminating in a rich, resonant celebration chord.
 * Designed to spark profound dopamine and a victorious sense of triumph.
 */
function playVictoryChime(ctx: AudioContext, master: AudioNode): void {
  // Rapid ascending celebratory flourish (D major)
  const flourish = [
    { freq: 587.33, start: 0.0, duration: 0.7, gain: 0.13 },    // D5
    { freq: 739.99, start: 0.08, duration: 0.7, gain: 0.14 },   // F#5
    { freq: 880.0, start: 0.16, duration: 0.8, gain: 0.16 },    // A5
    { freq: 1174.66, start: 0.25, duration: 1.0, gain: 0.18 },  // D6
    { freq: 1479.98, start: 0.34, duration: 1.2, gain: 0.16 },  // F#6
  ];

  flourish.forEach((note) => {
    playBellVoice(ctx, master, {
      freq: note.freq,
      start: note.start,
      duration: note.duration,
      gain: note.gain,
      type: 'sine',
      sparkle: true,
    });
  });

  // Grand celebratory resolution chord at t = 0.45s with long, warm, shimmering reverberation
  const chordStart = 0.45;
  const grandChord = [
    { freq: 146.83, duration: 2.2, gain: 0.18, type: 'triangle' as const, warmth: true }, // D3 (warm sub-anchor)
    { freq: 293.66, duration: 2.5, gain: 0.16, type: 'sine' as const },                   // D4
    { freq: 440.0, duration: 2.5, gain: 0.15, type: 'sine' as const },                    // A4
    { freq: 587.33, duration: 2.8, gain: 0.18, type: 'sine' as const, warmth: true },     // D5
    { freq: 739.99, duration: 2.8, gain: 0.17, type: 'sine' as const },                   // F#5
    { freq: 880.0, duration: 3.0, gain: 0.18, type: 'sine' as const, sparkle: true },     // A5
    { freq: 1174.66, duration: 3.2, gain: 0.14, type: 'sine' as const, sparkle: true },   // D6 (crystalline top)
  ];

  grandChord.forEach((note) => {
    playBellVoice(ctx, master, {
      freq: note.freq,
      start: chordStart,
      duration: note.duration,
      gain: note.gain,
      type: note.type,
      sparkle: note.sparkle,
      warmth: note.warmth,
    });
  });
}

/**
 * 2. "أجراس الإنجاز الماسية" (Crystal Diamond Chimes)
 * Pure, sparkling, clear celesta / glockenspiel bells that sound pristine, joyful, and pristine.
 */
function playCrystalChime(ctx: AudioContext, master: AudioNode): void {
  const notes = [
    { freq: 659.25, start: 0.0, duration: 1.1, gain: 0.14 },    // E5
    { freq: 830.61, start: 0.11, duration: 1.2, gain: 0.15 },   // G#5
    { freq: 987.77, start: 0.22, duration: 1.3, gain: 0.17 },   // B5
    { freq: 1318.51, start: 0.33, duration: 1.6, gain: 0.19 },  // E6
    { freq: 1661.22, start: 0.45, duration: 1.8, gain: 0.17 },  // G#6
    { freq: 1975.53, start: 0.58, duration: 2.4, gain: 0.15 },  // B6 (sparkling star)
  ];

  notes.forEach((note) => {
    playBellVoice(ctx, master, {
      freq: note.freq,
      start: note.start,
      duration: note.duration,
      gain: note.gain,
      sparkle: true,
      detuneCents: 5,
    });
  });
}

/**
 * 3. "أثير الإلهام الملكي" (Celestial Warm Chimes)
 * Deep, uplifting, serene harmonic chord with gentle swell and crystalline peace.
 */
function playCelestialChime(ctx: AudioContext, master: AudioNode): void {
  const padNotes = [
    { freq: 220.0, start: 0.0, duration: 2.8, gain: 0.14 },    // A3
    { freq: 329.63, start: 0.05, duration: 2.8, gain: 0.13 },  // E4
    { freq: 440.0, start: 0.1, duration: 3.0, gain: 0.15 },   // A4
    { freq: 554.37, start: 0.2, duration: 3.0, gain: 0.14 },   // C#5
    { freq: 659.25, start: 0.32, duration: 3.2, gain: 0.16 },  // E5
    { freq: 880.0, start: 0.46, duration: 3.4, gain: 0.15 },   // A5
  ];

  padNotes.forEach((note) => {
    playBellVoice(ctx, master, {
      freq: note.freq,
      start: note.start,
      duration: note.duration,
      gain: note.gain,
      warmth: true,
      sparkle: true,
    });
  });
}

/**
 * 4. "نبض الطاقة والنشوة" (Energetic Spark Riff)
 * Fast, snappy modern synthesizer triumph riff with punchy envelopes and lively brightness.
 */
function playEnergeticChime(ctx: AudioContext, master: AudioNode): void {
  const now = ctx.currentTime;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1500, now);
  filter.frequency.exponentialRampToValueAtTime(6000, now + 0.3);
  filter.frequency.exponentialRampToValueAtTime(2000, now + 1.8);
  filter.Q.setValueAtTime(3.5, now);
  filter.connect(master);

  const riff = [
    { freq: 523.25, start: 0.0, duration: 0.18, gain: 0.16 },   // C5
    { freq: 659.25, start: 0.09, duration: 0.18, gain: 0.16 },  // E5
    { freq: 783.99, start: 0.18, duration: 0.22, gain: 0.18 },  // G5
    { freq: 1046.5, start: 0.27, duration: 0.3, gain: 0.2 },    // C6
    { freq: 1318.51, start: 0.38, duration: 0.35, gain: 0.2 },  // E6
    { freq: 1567.98, start: 0.5, duration: 2.0, gain: 0.22 },   // G6 (victory sustain)
  ];

  riff.forEach((note) => {
    playBellVoice(ctx, filter, {
      freq: note.freq,
      start: note.start,
      duration: note.duration,
      gain: note.gain,
      type: 'triangle',
      detuneCents: 6,
      sparkle: true,
    });
  });
}

/**
 * Plays the triumphant, motivational completion chime when a focus or break session finishes.
 */
export function playCompletionChime(
  enabled: boolean = true,
  theme: CompletionSoundTheme = 'victory'
): void {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const master = createMasterBus(ctx);

    switch (theme) {
      case 'crystal':
        playCrystalChime(ctx, master);
        break;
      case 'celestial':
        playCelestialChime(ctx, master);
        break;
      case 'energetic':
        playEnergeticChime(ctx, master);
        break;
      case 'victory':
      default:
        playVictoryChime(ctx, master);
        break;
    }
  } catch {
    // Ignore audio errors if browser blocks autoplay or user hasn't interacted yet
  }
}

/**
 * Subtle soft click feedback when starting or pausing the timer.
 */
export function playSoftInteractionTone(enabled: boolean = true): void {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(560, now + 0.05);

    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.linearRampToValueAtTime(0.04, now + 0.008);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);
  } catch {
    // Ignore audio errors
  }
}

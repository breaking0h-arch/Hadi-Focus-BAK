import { AppSettings, PersistedTimerState, StudySession, Subject } from '../types/study';
import { toLocalDateKey } from './format';

const STORAGE_KEYS = {
  SUBJECTS: 'tarkeez_subjects_v1',
  SESSIONS: 'tarkeez_sessions_v1',
  SETTINGS: 'tarkeez_settings_v1',
  ACTIVE_TIMER: 'tarkeez_active_timer_v1',
  SEEDED: 'tarkeez_seeded_v1',
  THEME: 'tarkeez_theme_v1',
} as const;

export type ThemeMode = 'light' | 'dark';

export function loadTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      return 'dark';
    }
    return 'light';
  } catch {
    return 'light';
  }
}

export function saveTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch {
    // Ignore storage quota errors
  }
}

export const DEFAULT_SUBJECTS: Subject[] = [
  { id: 'subj-math', name: 'رياضيات', createdAt: 1700000001000 },
  { id: 'subj-physics', name: 'فيزياء', createdAt: 1700000002000 },
  { id: 'subj-chemistry', name: 'كيمياء', createdAt: 1700000003000 },
  { id: 'subj-religion', name: 'دين', createdAt: 1700000004000 },
  { id: 'subj-science', name: 'علوم', createdAt: 1700000005000 },
  { id: 'subj-english', name: 'إنكليزي', createdAt: 1700000006000 },
  { id: 'subj-arabic', name: 'عربي', createdAt: 1700000007000 },
  { id: 'subj-russian', name: 'روسي', createdAt: 1700000008000 },
];

export const DEFAULT_SETTINGS: AppSettings = {
  focusMinutes: 25,
  breakMinutes: 5,
  soundEnabled: true,
  autoStartBreak: false,
};

function createInitialSampleSessions(): StudySession[] {
  const now = Date.now();
  const todayKey = toLocalDateKey(now);

  // Yesterday key
  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayKey = toLocalDateKey(yesterdayDate.getTime());

  // Earlier today timestamps (safe relative offsets)
  const s1Duration = 1 * 3600 + 25 * 60 + 32; // 01:25:32
  const s1End = now - 45 * 60 * 1000;
  const s1Start = s1End - s1Duration * 1000;

  const s2Duration = 52 * 60 + 10; // 00:52:10
  const s2End = s1Start - 30 * 60 * 1000;
  const s2Start = s2End - s2Duration * 1000;

  const s3Duration = 35 * 60 + 20; // 00:35:20
  const s3End = s2Start - 25 * 60 * 1000;
  const s3Start = s3End - s3Duration * 1000;

  // Yesterday sessions
  const y1Duration = 50 * 60; // 00:50:00
  const y1End = yesterdayDate.getTime() - 120 * 60 * 1000;
  const y1Start = y1End - y1Duration * 1000;

  const y2Duration = 25 * 60; // 00:25:00
  const y2End = y1Start - 40 * 60 * 1000;
  const y2Start = y2End - y2Duration * 1000;

  return [
    {
      id: 'session-init-1',
      subjectId: 'subj-math',
      subjectName: 'رياضيات',
      durationSec: s1Duration,
      targetDurationSec: 5400,
      startedAt: s1Start,
      endedAt: s1End,
      dateKey: todayKey,
    },
    {
      id: 'session-init-2',
      subjectId: 'subj-physics',
      subjectName: 'فيزياء',
      durationSec: s2Duration,
      targetDurationSec: 3000,
      startedAt: s2Start,
      endedAt: s2End,
      dateKey: todayKey,
    },
    {
      id: 'session-init-3',
      subjectId: 'subj-chemistry',
      subjectName: 'كيمياء',
      durationSec: s3Duration,
      targetDurationSec: 2100,
      startedAt: s3Start,
      endedAt: s3End,
      dateKey: todayKey,
    },
    {
      id: 'session-init-4',
      subjectId: 'subj-english',
      subjectName: 'إنكليزي',
      durationSec: y1Duration,
      targetDurationSec: 3000,
      startedAt: y1Start,
      endedAt: y1End,
      dateKey: yesterdayKey,
    },
    {
      id: 'session-init-5',
      subjectId: 'subj-arabic',
      subjectName: 'عربي',
      durationSec: y2Duration,
      targetDurationSec: 1500,
      startedAt: y2Start,
      endedAt: y2End,
      dateKey: yesterdayKey,
    },
  ];
}

export function loadSubjects(): Subject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(DEFAULT_SUBJECTS));
      return DEFAULT_SUBJECTS;
    }
    const parsed = JSON.parse(raw) as Subject[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(DEFAULT_SUBJECTS));
      return DEFAULT_SUBJECTS;
    }
    return parsed;
  } catch {
    return DEFAULT_SUBJECTS;
  }
}

export function saveSubjects(subjects: Subject[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  } catch {
    // Ignore storage quota errors
  }
}

export function loadSessions(): StudySession[] {
  try {
    const seeded = localStorage.getItem(STORAGE_KEYS.SEEDED);
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!raw && !seeded) {
      const initial = createInitialSampleSessions();
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(initial));
      localStorage.setItem(STORAGE_KEYS.SEEDED, 'true');
      return initial;
    }
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StudySession[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSessions(sessions: StudySession[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    localStorage.setItem(STORAGE_KEYS.SEEDED, 'true');
  } catch {
    // Ignore storage quota errors
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      focusMinutes:
        typeof parsed.focusMinutes === 'number' && parsed.focusMinutes >= 1 && parsed.focusMinutes <= 180
          ? parsed.focusMinutes
          : DEFAULT_SETTINGS.focusMinutes,
      breakMinutes:
        typeof parsed.breakMinutes === 'number' && parsed.breakMinutes >= 1 && parsed.breakMinutes <= 60
          ? parsed.breakMinutes
          : DEFAULT_SETTINGS.breakMinutes,
      soundEnabled:
        typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : DEFAULT_SETTINGS.soundEnabled,
      autoStartBreak:
        typeof parsed.autoStartBreak === 'boolean'
          ? parsed.autoStartBreak
          : DEFAULT_SETTINGS.autoStartBreak,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {
    // Ignore storage quota errors
  }
}

export function loadPersistedTimer(): PersistedTimerState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_TIMER);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedTimerState;
    if (!parsed || typeof parsed.targetDurationSec !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function savePersistedTimer(state: PersistedTimerState | null): void {
  try {
    if (!state) {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_TIMER);
    } else {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TIMER, JSON.stringify(state));
    }
  } catch {
    // Ignore storage quota errors
  }
}

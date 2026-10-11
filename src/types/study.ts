export type NavigationTab = 'home' | 'log' | 'settings';

export type TimerMode = 'focus' | 'break';

export type TimerStatus = 'idle' | 'running' | 'paused';

export interface Subject {
  id: string;
  name: string;
  createdAt: number;
}

export interface StudySession {
  id: string;
  subjectId: string;
  subjectName: string;
  /** Actual studied duration in seconds */
  durationSec: number;
  /** Configured target duration in seconds */
  targetDurationSec: number;
  /** Epoch timestamp (ms) when session started */
  startedAt: number;
  /** Epoch timestamp (ms) when session ended */
  endedAt: number;
  /** Local date string YYYY-MM-DD */
  dateKey: string;
  /** Micro-commitment pledge written before session */
  taskGoal?: string;
  /** Whether commitment was marked as completed */
  goalCompleted?: boolean;
}

export type CompletionSoundTheme = 'victory' | 'crystal' | 'celestial' | 'energetic';

export interface AppSettings {
  focusMinutes: number;
  breakMinutes: number;
  soundEnabled: boolean;
  autoStartBreak: boolean;
  /** Strict anti-quit shield enabling 10s cooldown before early exit */
  strictModeEnabled?: boolean;
  /** Custom completion audio theme */
  completionSoundTheme?: CompletionSoundTheme;
}

export interface PersistedTimerState {
  status: TimerStatus;
  mode: TimerMode;
  subjectId: string;
  targetDurationSec: number;
  /** Elapsed milliseconds accumulated before the latest resume */
  accumulatedElapsedMs: number;
  /** Epoch timestamp (ms) when timer was last started/resumed, or null if paused/idle */
  lastResumedAt: number | null;
  /** Epoch timestamp (ms) when this session originally started */
  sessionStartedAt: number | null;
  /** Ongoing micro-commitment */
  taskGoal?: string;
}

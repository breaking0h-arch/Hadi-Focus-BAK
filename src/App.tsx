import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Square,
  Maximize2,
  CheckCircle2,
  ArrowLeft,
  Clock,
} from 'lucide-react';
import {
  AppSettings,
  NavigationTab,
  PersistedTimerState,
  StudySession,
  Subject,
  TimerMode,
  TimerStatus,
} from './types/study';
import {
  DEFAULT_SUBJECTS,
  ThemeMode,
  loadPersistedTimer,
  loadSessions,
  loadSettings,
  loadSubjects,
  loadTheme,
  savePersistedTimer,
  saveSessions,
  saveSettings,
  saveSubjects,
  saveTheme,
} from './utils/storage';
import {
  formatDurationArabic,
  formatDurationClock,
  formatShortDurationArabic,
  formatTimeOfDayArabic,
  formatTimerDigits,
  toLocalDateKey,
} from './utils/format';
import { playCompletionChime, playSoftInteractionTone } from './utils/sound';
import { TopBar } from './components/TopBar';
import { SubjectSelector } from './components/SubjectSelector';
import { CircularTimer } from './components/CircularTimer';
import { FullscreenFocusView } from './components/FullscreenFocusView';
import { StudyLogView } from './components/StudyLogView';
import { SettingsView } from './components/SettingsView';

interface CompletionNotice {
  title: string;
  subtitle: string;
}

export default function App() {
  // Theme State (persisted in localStorage, defaults to system preference on first visit)
  const [theme, setTheme] = useState<ThemeMode>(() => loadTheme());

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
      saveTheme(next);
      return next;
    });
  }, []);

  // Navigation
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Core Data
  const [subjects, setSubjects] = useState<Subject[]>(() => loadSubjects());
  const [sessions, setSessions] = useState<StudySession[]>(() => loadSessions());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  // Timer State (Initialized from persisted state if available)
  const initialTimer = useMemo(() => loadPersistedTimer(), []);

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(() => {
    if (initialTimer?.subjectId) return initialTimer.subjectId;
    const loaded = loadSubjects();
    return loaded[0]?.id || DEFAULT_SUBJECTS[0].id;
  });

  const [mode, setMode] = useState<TimerMode>(() => initialTimer?.mode || 'focus');
  const [status, setStatus] = useState<TimerStatus>(() => initialTimer?.status || 'idle');
  const [targetDurationSec, setTargetDurationSec] = useState<number>(() => {
    if (initialTimer?.targetDurationSec) return initialTimer.targetDurationSec;
    const s = loadSettings();
    return s.focusMinutes * 60;
  });
  const [accumulatedElapsedMs, setAccumulatedElapsedMs] = useState<number>(
    () => initialTimer?.accumulatedElapsedMs || 0
  );
  const [lastResumedAt, setLastResumedAt] = useState<number | null>(
    () => initialTimer?.lastResumedAt || null
  );
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(
    () => initialTimer?.sessionStartedAt || null
  );

  // Real-time clock tick for accurate timestamp calculation
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [completionNotice, setCompletionNotice] = useState<CompletionNotice | null>(null);

  const isDark = theme === 'dark';

  // Selected subject object
  const selectedSubject = useMemo(() => {
    return (
      subjects.find((s) => s.id === selectedSubjectId) ||
      subjects[0] || { id: 'subj-math', name: 'رياضيات', createdAt: Date.now() }
    );
  }, [subjects, selectedSubjectId]);

  // Persist timer state whenever it changes
  useEffect(() => {
    if (status === 'idle') {
      savePersistedTimer(null);
    } else {
      const stateToSave: PersistedTimerState = {
        status,
        mode,
        subjectId: selectedSubject.id,
        targetDurationSec,
        accumulatedElapsedMs,
        lastResumedAt,
        sessionStartedAt,
      };
      savePersistedTimer(stateToSave);
    }
  }, [
    status,
    mode,
    selectedSubject.id,
    targetDurationSec,
    accumulatedElapsedMs,
    lastResumedAt,
    sessionStartedAt,
  ]);

  // Calculate exact elapsed & remaining seconds from real timestamps
  const totalElapsedMs = useMemo(() => {
    if (status === 'idle') return 0;
    if (status === 'paused' || lastResumedAt === null) {
      return accumulatedElapsedMs;
    }
    return accumulatedElapsedMs + Math.max(0, nowMs - lastResumedAt);
  }, [status, accumulatedElapsedMs, lastResumedAt, nowMs]);

  const elapsedSeconds = Math.floor(totalElapsedMs / 1000);
  const remainingSeconds = Math.max(0, targetDurationSec - elapsedSeconds);

  // Update document title with live timer when running/paused
  useEffect(() => {
    if (status === 'running' || status === 'paused') {
      const digits = formatTimerDigits(remainingSeconds);
      const label = mode === 'focus' ? selectedSubject.name : 'استراحة';
      document.title = `(${digits}) ${label} — تركيز`;
    } else {
      document.title = 'تركيز — مؤقت الدراسة الفعلي';
    }
  }, [status, remainingSeconds, mode, selectedSubject.name]);

  // Record a study session into the persistent log
  const recordStudySession = useCallback(
    (durationSec: number, startMs: number, endMs: number) => {
      if (durationSec < 1) return;
      const newSession: StudySession = {
        id: `session-${endMs}-${Math.random().toString(36).slice(2, 7)}`,
        subjectId: selectedSubject.id,
        subjectName: selectedSubject.name,
        durationSec,
        targetDurationSec,
        startedAt: startMs,
        endedAt: endMs,
        dateKey: toLocalDateKey(endMs),
      };

      setSessions((prev) => {
        const updated = [newSession, ...prev];
        saveSessions(updated);
        return updated;
      });
    },
    [selectedSubject.id, selectedSubject.name, targetDurationSec]
  );

  // Handle natural timer completion (when remainingSeconds hits 0)
  useEffect(() => {
    if (status !== 'running') return;
    if (totalElapsedMs < targetDurationSec * 1000) return;

    const endMs = Date.now();
    const startMs = sessionStartedAt || endMs - targetDurationSec * 1000;

    playCompletionChime(settings.soundEnabled);

    if (mode === 'focus') {
      recordStudySession(targetDurationSec, startMs, endMs);
      setCompletionNotice({
        title: 'اكتملت جلسة التركيز بنجاح',
        subtitle: `تم تسجيل ${formatShortDurationArabic(targetDurationSec)} في مادة ${selectedSubject.name}`,
      });

      setStatus('idle');
      setMode('break');
      setTargetDurationSec(settings.breakMinutes * 60);
      setAccumulatedElapsedMs(0);
      setLastResumedAt(null);
      setSessionStartedAt(null);
    } else {
      setCompletionNotice({
        title: 'انتهت الاستراحة القصيرة',
        subtitle: `جاهز لبدء جلسة تركيز جديدة في مادة ${selectedSubject.name}`,
      });

      setStatus('idle');
      setMode('focus');
      setTargetDurationSec(settings.focusMinutes * 60);
      setAccumulatedElapsedMs(0);
      setLastResumedAt(null);
      setSessionStartedAt(null);
    }
  }, [
    status,
    totalElapsedMs,
    targetDurationSec,
    sessionStartedAt,
    settings.soundEnabled,
    settings.breakMinutes,
    settings.focusMinutes,
    mode,
    recordStudySession,
    selectedSubject.name,
  ]);

  // High-precision ticker + tab visibility sync
  useEffect(() => {
    if (status !== 'running') return;

    const tick = () => {
      setNowMs(Date.now());
    };

    tick();
    const intervalId = window.setInterval(tick, 200);

    const handleVisibilityOrFocus = () => {
      setNowMs(Date.now());
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, [status]);

  // Auto-dismiss completion banner after 6 seconds
  useEffect(() => {
    if (!completionNotice) return;
    const t = window.setTimeout(() => setCompletionNotice(null), 6000);
    return () => window.clearTimeout(t);
  }, [completionNotice]);

  // Timer Controls
  const handleStart = useCallback(() => {
    const now = Date.now();
    playSoftInteractionTone(settings.soundEnabled);
    setCompletionNotice(null);
    setNowMs(now);
    setAccumulatedElapsedMs(0);
    setSessionStartedAt(now);
    setLastResumedAt(now);
    setStatus('running');
  }, [settings.soundEnabled]);

  const handlePause = useCallback(() => {
    if (status !== 'running') return;
    const now = Date.now();
    playSoftInteractionTone(settings.soundEnabled);
    const additional = lastResumedAt ? Math.max(0, now - lastResumedAt) : 0;
    setAccumulatedElapsedMs((prev) => prev + additional);
    setLastResumedAt(null);
    setNowMs(now);
    setStatus('paused');
  }, [status, lastResumedAt, settings.soundEnabled]);

  const handleResume = useCallback(() => {
    if (status !== 'paused') return;
    const now = Date.now();
    playSoftInteractionTone(settings.soundEnabled);
    setNowMs(now);
    setLastResumedAt(now);
    setStatus('running');
  }, [status, settings.soundEnabled]);

  const handleReset = useCallback(() => {
    setStatus('idle');
    setAccumulatedElapsedMs(0);
    setLastResumedAt(null);
    setSessionStartedAt(null);
    setTargetDurationSec(
      mode === 'focus' ? settings.focusMinutes * 60 : settings.breakMinutes * 60
    );
  }, [mode, settings.focusMinutes, settings.breakMinutes]);

  const handleEndSessionEarly = useCallback(() => {
    if (status === 'idle') return;
    const now = Date.now();
    const currentTotalMs =
      status === 'running' && lastResumedAt
        ? accumulatedElapsedMs + Math.max(0, now - lastResumedAt)
        : accumulatedElapsedMs;

    const studiedSec = Math.min(
      targetDurationSec,
      Math.max(1, Math.round(currentTotalMs / 1000))
    );

    if (mode === 'focus' && studiedSec >= 1) {
      const startMs = sessionStartedAt || now - studiedSec * 1000;
      recordStudySession(studiedSec, startMs, now);
      playCompletionChime(settings.soundEnabled);
      setCompletionNotice({
        title: 'تم حفظ الجلسة في السجل',
        subtitle: `${selectedSubject.name} · ${formatDurationClock(studiedSec)}`,
      });
    }

    setStatus('idle');
    setAccumulatedElapsedMs(0);
    setLastResumedAt(null);
    setSessionStartedAt(null);
    setTargetDurationSec(
      mode === 'focus' ? settings.focusMinutes * 60 : settings.breakMinutes * 60
    );
  }, [
    status,
    lastResumedAt,
    accumulatedElapsedMs,
    targetDurationSec,
    mode,
    sessionStartedAt,
    recordStudySession,
    settings.soundEnabled,
    settings.focusMinutes,
    settings.breakMinutes,
    selectedSubject.name,
  ]);

  const handleSwitchMode = (newMode: TimerMode) => {
    if (status !== 'idle') return;
    setMode(newMode);
    setTargetDurationSec(
      newMode === 'focus' ? settings.focusMinutes * 60 : settings.breakMinutes * 60
    );
  };

  // Fullscreen helpers
  const handleEnterFullscreen = useCallback(() => {
    setIsFullscreen(true);
    try {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch {
      // Ignore in restricted iframe
    }
  }, []);

  const handleExitFullscreen = useCallback(() => {
    setIsFullscreen(false);
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    } catch {
      // Ignore
    }
  }, []);

  // Subject Handlers
  const handleAddSubject = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    setSubjects((prev) => {
      const existing = prev.find((s) => s.name === trimmed);
      if (existing) {
        setSelectedSubjectId(existing.id);
        return prev;
      }
      const newSubj: Subject = {
        id: `subj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: trimmed,
        createdAt: Date.now(),
      };
      const updated = [...prev, newSubj];
      saveSubjects(updated);
      setSelectedSubjectId(newSubj.id);
      return updated;
    });
  }, []);

  const handleDeleteSubject = useCallback(
    (id: string) => {
      setSubjects((prev) => {
        if (prev.length <= 1) return prev;
        const updated = prev.filter((s) => s.id !== id);
        saveSubjects(updated);
        if (selectedSubjectId === id && updated.length > 0) {
          setSelectedSubjectId(updated[0].id);
        }
        return updated;
      });
    },
    [selectedSubjectId]
  );

  const handleResetDefaultSubjects = useCallback(() => {
    saveSubjects(DEFAULT_SUBJECTS);
    setSubjects(DEFAULT_SUBJECTS);
    setSelectedSubjectId(DEFAULT_SUBJECTS[0].id);
  }, []);

  // Settings & Log Handlers
  const handleUpdateSettings = useCallback(
    (newSettings: AppSettings) => {
      setSettings(newSettings);
      saveSettings(newSettings);
      if (status === 'idle') {
        setTargetDurationSec(
          mode === 'focus' ? newSettings.focusMinutes * 60 : newSettings.breakMinutes * 60
        );
      }
    },
    [status, mode]
  );

  const handleToggleSound = useCallback(() => {
    setSettings((prev) => {
      const updated = { ...prev, soundEnabled: !prev.soundEnabled };
      saveSettings(updated);
      return updated;
    });
  }, []);

  const handleDeleteSession = useCallback((id: string) => {
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      saveSessions(updated);
      return updated;
    });
  }, []);

  const handleClearAllSessions = useCallback(() => {
    setSessions([]);
    saveSessions([]);
  }, []);

  // Today's study summary & latest session for the bottom of the Home screen
  const homeFooterSummary = useMemo(() => {
    const todayKey = toLocalDateKey(Date.now());
    let todayTotalSec = 0;
    for (const s of sessions) {
      if (s.dateKey === todayKey) {
        todayTotalSec += s.durationSec;
      }
    }
    const latestSession = sessions.length > 0 ? sessions[0] : null;
    return { todayTotalSec, latestSession };
  }, [sessions]);

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-white dark:bg-[#0F172A] text-slate-950 dark:text-slate-100 flex flex-col relative transition-colors duration-200"
    >
      {/* Fullscreen Focus Mode Overlay */}
      {isFullscreen && (
        <FullscreenFocusView
          subjectName={selectedSubject.name}
          remainingSeconds={remainingSeconds}
          totalSeconds={targetDurationSec}
          status={status}
          mode={mode}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onStart={handleStart}
          onPause={handlePause}
          onResume={handleResume}
          onEndSession={handleEndSessionEarly}
          onReset={handleReset}
          onExitFullscreen={handleExitFullscreen}
        />
      )}

      {/* Top Navigation Bar */}
      <TopBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        soundEnabled={settings.soundEnabled}
        onToggleSound={handleToggleSound}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onEnterFullscreen={handleEnterFullscreen}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'home' && (
          <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex-1 flex flex-col justify-between gap-7">
            {/* Completion Toast Banner */}
            {completionNotice && (
              <div
                role="status"
                className="bg-blue-50/90 dark:bg-blue-950/50 border border-blue-200/90 dark:border-blue-800/60 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 text-blue-950 dark:text-blue-100 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <div className="text-xs sm:text-sm">
                    <span className="font-bold">{completionNotice.title}</span>
                    <span className="mx-1.5 text-blue-400">·</span>
                    <span className="text-blue-800 dark:text-blue-200">
                      {completionNotice.subtitle}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('log')}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 whitespace-nowrap"
                >
                  عرض السجل
                </button>
              </div>
            )}

            {/* 1. Subject Selector */}
            <SubjectSelector
              subjects={subjects}
              selectedSubjectId={selectedSubject.id}
              onSelectSubject={setSelectedSubjectId}
              onAddSubject={handleAddSubject}
              onDeleteSubject={handleDeleteSubject}
              timerStatus={status}
            />

            {/* 2. The Main Timer Card with Corner Blue Ambient Glow */}
            <div className="relative">
              {/* Outer soft blue ambient corner glow behind the card */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-6 -right-6 w-72 h-72 rounded-full bg-blue-500/[0.11] dark:bg-blue-500/[0.14] blur-3xl"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-6 -left-6 w-60 h-60 rounded-full bg-blue-600/[0.06] dark:bg-blue-600/[0.08] blur-3xl"
              />

              {/* Timer Card */}
              <div className="relative bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200/85 dark:border-slate-800 shadow-[0_10px_40px_-15px_rgba(15,23,42,0.06)] dark:shadow-[0_14px_45px_-15px_rgba(0,0,0,0.4)] px-5 sm:px-10 py-7 sm:py-9 overflow-hidden transition-colors duration-200">
                {/* Inner Corner Blue Ambient Radial Glow */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full"
                  style={{
                    background: isDark
                      ? 'radial-gradient(circle, rgba(59, 130, 246, 0.16) 0%, rgba(37, 99, 235, 0.06) 45%, rgba(30, 41, 59, 0) 75%)'
                      : 'radial-gradient(circle, rgba(37, 99, 235, 0.13) 0%, rgba(59, 130, 246, 0.05) 45%, rgba(255, 255, 255, 0) 75%)',
                  }}
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-28 -left-28 w-72 h-72 rounded-full"
                  style={{
                    background: isDark
                      ? 'radial-gradient(circle, rgba(59, 130, 246, 0.09) 0%, rgba(30, 41, 59, 0) 70%)'
                      : 'radial-gradient(circle, rgba(37, 99, 235, 0.07) 0%, rgba(255, 255, 255, 0) 70%)',
                  }}
                />

                {/* Card Top Header: Mode Switcher + Selected Subject & Fullscreen Button */}
                <div className="relative z-10 flex items-center justify-between gap-2 mb-6">
                  {/* Pomodoro Mode Switcher */}
                  <div className="inline-flex items-center p-1 rounded-xl bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800">
                    <button
                      type="button"
                      disabled={status !== 'idle'}
                      onClick={() => handleSwitchMode('focus')}
                      className={`h-8 px-3.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                        mode === 'focus'
                          ? 'bg-white dark:bg-[#1E293B] text-blue-600 dark:text-blue-400 shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 disabled:opacity-50'
                      }`}
                    >
                      تركيز · {settings.focusMinutes} د
                    </button>
                    <button
                      type="button"
                      disabled={status !== 'idle'}
                      onClick={() => handleSwitchMode('break')}
                      className={`h-8 px-3.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                        mode === 'break'
                          ? 'bg-white dark:bg-[#1E293B] text-blue-600 dark:text-blue-400 shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 disabled:opacity-50'
                      }`}
                    >
                      استراحة · {settings.breakMinutes} د
                    </button>
                  </div>

                  {/* Active Subject Indicator & Fullscreen Trigger */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 px-2.5 py-1">
                      {selectedSubject.name}
                    </span>

                    <button
                      type="button"
                      onClick={handleEnterFullscreen}
                      title="فتح وضع ملء الشاشة للتركيز"
                      className="h-9 px-3 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-50 dark:bg-slate-900/70 hover:bg-blue-50/60 dark:hover:bg-blue-950/40 border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-200 dark:hover:border-blue-500/40 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>ملء الشاشة</span>
                    </button>
                  </div>
                </div>

                {/* Centerpiece Circular Timer */}
                <div className="relative z-10 my-2 sm:my-4">
                  <CircularTimer
                    remainingSeconds={remainingSeconds}
                    totalSeconds={targetDurationSec}
                    status={status}
                    mode={mode}
                    isFullscreen={false}
                    isDark={isDark}
                  />
                </div>

                {/* Primary Controls Beneath Timer */}
                <div className="relative z-10 mt-7 flex flex-wrap items-center justify-center gap-3">
                  {status === 'idle' ? (
                    <button
                      type="button"
                      onClick={handleStart}
                      className="h-12 px-9 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-semibold shadow-sm shadow-blue-600/25 hover:shadow-md hover:shadow-blue-600/30 transition-all duration-150 flex items-center justify-center gap-2.5 whitespace-nowrap active:scale-[0.98]"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>
                        {mode === 'focus' ? 'ابدأ جلسة التركيز' : 'ابدأ الاستراحة القصيرة'}
                      </span>
                    </button>
                  ) : (
                    <>
                      {status === 'running' ? (
                        <button
                          type="button"
                          onClick={handlePause}
                          className="h-12 px-6 rounded-2xl bg-slate-950 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-sm font-semibold transition-all duration-150 flex items-center gap-2 whitespace-nowrap active:scale-[0.98]"
                        >
                          <Pause className="w-4 h-4" />
                          <span>إيقاف مؤقت</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResume}
                          className="h-12 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm shadow-blue-600/20 transition-all duration-150 flex items-center gap-2 whitespace-nowrap active:scale-[0.98]"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span>استئناف الجلسة</span>
                        </button>
                      )}

                      {mode === 'focus' && (
                        <button
                          type="button"
                          onClick={handleEndSessionEarly}
                          className="h-12 px-6 rounded-2xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100/80 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 text-sm font-semibold transition-all duration-150 flex items-center gap-2 whitespace-nowrap active:scale-[0.98]"
                        >
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span>إنهاء وحفظ الجلسة</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleReset}
                        className="h-12 px-4 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 border border-slate-200 dark:border-slate-700 text-sm font-medium transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap active:scale-[0.98]"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>إعادة ضبط</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Simple Bottom Summary: Today's Study Time & Latest Session */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                  <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>وقت الدراسة اليوم:</span>
                </span>
                <span className="font-bold text-slate-950 dark:text-slate-100">
                  {formatDurationArabic(homeFooterSummary.todayTotalSec)}
                </span>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                  ·
                </span>
                <span dir="ltr" className="font-timer text-blue-600 dark:text-blue-400 font-semibold">
                  {formatDurationClock(homeFooterSummary.todayTotalSec)}
                </span>
              </div>

              {homeFooterSummary.latestSession ? (
                <button
                  type="button"
                  onClick={() => setActiveTab('log')}
                  className="inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                >
                  <span>
                    آخر جلسة:{' '}
                    <strong className="text-slate-800 dark:text-slate-200">
                      {homeFooterSummary.latestSession.subjectName}
                    </strong>{' '}
                    ({formatShortDurationArabic(homeFooterSummary.latestSession.durationSec)} ·{' '}
                    {formatTimeOfDayArabic(homeFooterSummary.latestSession.endedAt)})
                  </span>
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-transform group-hover:-translate-x-0.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveTab('log')}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <span>عرض سجل الدراسة</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'log' && (
          <StudyLogView
            sessions={sessions}
            subjects={subjects}
            onDeleteSession={handleDeleteSession}
            onNavigateHome={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            subjects={subjects}
            onAddSubject={handleAddSubject}
            onDeleteSubject={handleDeleteSubject}
            onResetDefaultSubjects={handleResetDefaultSubjects}
            onClearAllSessions={handleClearAllSessions}
            sessionsCount={sessions.length}
            timerStatus={status}
          />
        )}
      </main>
    </div>
  );
}

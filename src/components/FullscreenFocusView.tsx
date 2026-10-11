import React, { useEffect } from 'react';
import { Minimize2, Pause, Play, RotateCcw, Square, Sun, Moon, Contrast, Target } from 'lucide-react';
import { TimerMode, TimerStatus } from '../types/study';
import { ThemeMode } from '../utils/storage';
import { CircularTimer } from './CircularTimer';

interface FullscreenFocusViewProps {
  subjectName: string;
  remainingSeconds: number;
  totalSeconds: number;
  status: TimerStatus;
  mode: TimerMode;
  theme: ThemeMode;
  taskGoal?: string;
  onToggleTheme: () => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onEndSession: () => void;
  onReset: () => void;
  onExitFullscreen: () => void;
}

export const FullscreenFocusView: React.FC<FullscreenFocusViewProps> = ({
  subjectName,
  remainingSeconds,
  totalSeconds,
  status,
  mode,
  theme,
  taskGoal,
  onToggleTheme,
  onStart,
  onPause,
  onResume,
  onEndSession,
  onReset,
  onExitFullscreen,
}) => {
  const isDark = theme !== 'light';

  // Escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExitFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExitFullscreen]);

  const lightBackground = [
    'radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.22) 0%, rgba(59, 130, 246, 0.14) 18%, rgba(59, 130, 246, 0.07) 35%, rgba(59, 130, 246, 0.025) 52%, transparent 72%)',
    'radial-gradient(circle at 100% 100%, rgba(59, 130, 246, 0.12) 0%, rgba(59, 130, 246, 0.05) 25%, transparent 55%)',
    '#FFFFFF',
  ].join(', ');

  const navyBackground = [
    'radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.20) 0%, rgba(37, 99, 235, 0.12) 18%, rgba(37, 99, 235, 0.05) 36%, rgba(37, 99, 235, 0.015) 52%, transparent 72%)',
    'radial-gradient(circle at 100% 100%, rgba(59, 130, 246, 0.11) 0%, rgba(37, 99, 235, 0.04) 25%, transparent 55%)',
    '#0F172A',
  ].join(', ');

  const blackBackground = [
    'radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.16) 0%, rgba(37, 99, 235, 0.08) 18%, rgba(37, 99, 235, 0.025) 36%, transparent 65%)',
    'radial-gradient(circle at 100% 100%, rgba(59, 130, 246, 0.09) 0%, rgba(37, 99, 235, 0.025) 25%, transparent 50%)',
    '#000000',
  ].join(', ');

  const currentBackground =
    theme === 'light'
      ? lightBackground
      : theme === 'navy'
      ? navyBackground
      : blackBackground;

  const totalMins = Math.round(totalSeconds / 60);

  const getThemeTitle = () => {
    if (theme === 'light') return 'الوضع الحالي: نهاري (انقر للتبديل إلى كحلي)';
    if (theme === 'navy') return 'الوضع الحالي: كحلي (انقر للتبديل إلى أسود)';
    return 'الوضع الحالي: أسود فاخر (انقر للتبديل إلى نهاري)';
  };

  const renderThemeIcon = () => {
    if (theme === 'light') return <Sun className="w-4 h-4 text-amber-500" />;
    if (theme === 'navy') return <Moon className="w-4 h-4 text-blue-400" />;
    return <Contrast className="w-4 h-4 text-slate-100" />;
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex flex-col justify-between items-center px-6 py-6 sm:py-10 overflow-hidden select-none transition-colors duration-200"
      style={{
        background: currentBackground,
      }}
    >
      {/* Soft Ambient Blue Corner Glows (Top-Left + Bottom-Right) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 -translate-x-1/5 -translate-y-1/5 w-[320px] h-[320px] sm:w-[500px] sm:h-[500px] lg:w-[680px] lg:h-[680px] rounded-full blur-3xl z-0"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(59, 130, 246, 0.16) 0%, rgba(37, 99, 235, 0.06) 42%, rgba(15, 23, 42, 0) 72%)'
            : 'radial-gradient(circle, rgba(59, 130, 246, 0.18) 0%, rgba(37, 99, 235, 0.08) 42%, rgba(255, 255, 255, 0) 72%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed bottom-0 right-0 translate-x-1/5 translate-y-1/5 w-[260px] h-[260px] sm:w-[420px] sm:h-[420px] lg:w-[560px] lg:h-[560px] rounded-full blur-3xl z-0"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(59, 130, 246, 0.11) 0%, rgba(37, 99, 235, 0.04) 45%, rgba(15, 23, 42, 0) 72%)'
            : 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, rgba(37, 99, 235, 0.045) 45%, rgba(255, 255, 255, 0) 72%)',
        }}
      />

      {/* Top Header: Subject Badge + Theme & Exit */}
      <div className="relative z-10 w-full max-w-4xl flex items-center justify-between">
        <div className="w-28" />

        <div className="flex items-center gap-2 text-center">
          <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
          <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {mode === 'focus' ? subjectName : `${subjectName} · استراحة`}
          </span>
          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60">
            {totalMins} دقيقة
          </span>
        </div>

        <div className="w-28 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onToggleTheme}
            title={getThemeTitle()}
            aria-label={getThemeTitle()}
            className="h-9 w-9 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/70 transition-colors flex items-center justify-center"
          >
            {renderThemeIcon()}
          </button>

          <button
            type="button"
            onClick={onExitFullscreen}
            title="خروج من ملء الشاشة (Esc)"
            className="h-9 px-3 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/70 transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <span>تصغير</span>
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Center: Hero Circular Timer */}
      <div className="relative z-10 my-auto flex flex-col items-center justify-center py-4">
        <CircularTimer
          remainingSeconds={remainingSeconds}
          totalSeconds={totalSeconds}
          status={status}
          mode={mode}
          isFullscreen={true}
          isDark={isDark}
        />

        {/* Micro-commitment Pledge in Fullscreen */}
        {taskGoal && taskGoal.trim().length > 0 && (
          <div className="mt-4 px-4 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-400/10 border border-blue-500/20 dark:border-blue-400/20 flex items-center gap-2 max-w-md animate-fade-in">
            <Target className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
              {taskGoal}
            </span>
          </div>
        )}

        {/* Calm, Dignified Status Notice */}
        <p className="mt-3 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 tracking-wide text-center">
          {status === 'running'
            ? 'أنت داخل جلسة تركيز كاملة — لا تدع أي شيء يشتتك'
            : status === 'paused'
            ? 'المؤقت متوقف مؤقتًا'
            : 'اضغط بدء لبدء جلسة التركيز'}
        </p>
      </div>

      {/* Bottom Controls */}
      <div className="relative z-10 w-full max-w-xl flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        {status === 'idle' ? (
          <button
            type="button"
            onClick={onStart}
            className="h-12 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-600/30 transition-all flex items-center gap-2.5 active:scale-[0.98]"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>ابدأ الجلسة فورًا ({subjectName})</span>
          </button>
        ) : (
          <>
            {status === 'running' ? (
              <button
                type="button"
                onClick={onPause}
                className="h-12 px-6 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-sm font-semibold transition-all duration-150 flex items-center gap-2 whitespace-nowrap active:scale-[0.98]"
              >
                <Pause className="w-4 h-4" />
                <span>إيقاف مؤقت</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onResume}
                className="h-12 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm shadow-blue-600/20 transition-all duration-150 flex items-center gap-2 whitespace-nowrap active:scale-[0.98]"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>استئناف</span>
              </button>
            )}

            {mode === 'focus' && (
              <button
                type="button"
                onClick={onEndSession}
                className="h-12 px-6 rounded-2xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100/80 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60 text-sm font-semibold transition-all duration-150 flex items-center gap-2 whitespace-nowrap active:scale-[0.98]"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>إنهاء وحفظ الجلسة</span>
              </button>
            )}

            <button
              type="button"
              onClick={onReset}
              className="h-12 px-5 rounded-2xl bg-white dark:bg-[#1E293B] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 text-sm font-medium transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap active:scale-[0.98]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>إعادة ضبط</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

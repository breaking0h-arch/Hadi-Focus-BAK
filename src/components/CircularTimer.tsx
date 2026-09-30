import React from 'react';
import { TimerMode, TimerStatus } from '../types/study';
import { formatTimerDigits } from '../utils/format';

interface CircularTimerProps {
  remainingSeconds: number;
  totalSeconds: number;
  status: TimerStatus;
  mode: TimerMode;
  isFullscreen?: boolean;
  isDark?: boolean;
}

export const CircularTimer: React.FC<CircularTimerProps> = ({
  remainingSeconds,
  totalSeconds,
  status,
  mode,
  isFullscreen = false,
  isDark = false,
}) => {
  const size = 320;
  const strokeWidth = isFullscreen ? 6.5 : 7;
  const center = size / 2;
  const radius = center - strokeWidth * 2 - 6; // 141px
  const circumference = 2 * Math.PI * radius;

  const elapsedSeconds = Math.max(0, totalSeconds - remainingSeconds);
  const progressFraction =
    totalSeconds > 0 ? Math.min(1, Math.max(0, elapsedSeconds / totalSeconds)) : 0;

  const activeFraction = status === 'idle' ? 1 : Math.max(0.015, 1 - progressFraction);
  const strokeDashoffset = circumference * (1 - activeFraction);

  const formattedDigits = formatTimerDigits(remainingSeconds);
  const isLongDigits = formattedDigits.length > 5;

  const getStatusLabel = (): string => {
    if (status === 'running') {
      return mode === 'focus' ? 'أنت داخل جلسة تركيز' : 'أنت في استراحة قصيرة';
    }
    if (status === 'paused') {
      return 'تم الإيقاف المؤقت';
    }
    return mode === 'focus' ? 'جاهز للبدء' : 'جاهز للاستراحة';
  };

  return (
    <div
      className={`relative mx-auto flex items-center justify-center select-none ${
        isFullscreen
          ? 'w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] md:w-[410px] md:h-[410px]'
          : 'w-[264px] h-[264px] sm:w-[308px] sm:h-[308px]'
      }`}
    >
      {/* Subtle ambient radial aura behind the ring */}
      <div
        className={`absolute -inset-6 rounded-full transition-opacity duration-700 pointer-events-none ${
          isFullscreen
            ? 'opacity-100 bg-radial from-blue-500/[0.055] via-blue-400/[0.02] to-transparent blur-2xl'
            : status === 'running'
            ? 'opacity-100 bg-radial from-blue-500/[0.06] via-blue-500/[0.02] to-transparent'
            : 'opacity-0'
        }`}
      />

      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full -rotate-90 transform overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="timerBlueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isDark ? '#2563EB' : '#1D4ED8'} />
            <stop offset="50%" stopColor={isDark ? '#3B82F6' : '#2563EB'} />
            <stop offset="100%" stopColor={isDark ? '#60A5FA' : '#3B82F6'} />
          </linearGradient>
        </defs>

        {/* Subtle inner structural hairline ring for visual balance */}
        <circle
          cx={center}
          cy={center}
          r={radius - 12}
          fill="none"
          stroke={isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF'}
          strokeWidth="1"
        />

        {/* Base circular track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE'}
          strokeWidth={strokeWidth}
        />

        {/* Active Blue Progress Ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="url(#timerBlueGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-[stroke-dashoffset] duration-300 ease-out"
          style={{
            filter:
              status === 'running'
                ? 'drop-shadow(0 0 8px rgba(37, 99, 235, 0.28))'
                : 'none',
          }}
        />
      </svg>

      {/* Center Content: Perfectly Aligned Numerals & Status */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
        <div
          dir="ltr"
          className={`font-timer font-bold tracking-tight text-[#0F172A] dark:text-slate-100 leading-none transition-colors duration-200 ${
            isFullscreen
              ? isLongDigits
                ? 'text-[3.1rem] sm:text-[4rem] md:text-[4.5rem]'
                : 'text-[3.75rem] sm:text-[4.75rem] md:text-[5.5rem]'
              : isLongDigits
              ? 'text-[2.85rem] sm:text-[3.35rem]'
              : 'text-[3.35rem] sm:text-[4rem]'
          }`}
        >
          {formattedDigits}
        </div>

        <div className="mt-3.5 flex items-center justify-center gap-2">
          {status === 'running' && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600 dark:bg-blue-400"></span>
            </span>
          )}
          <span
            className={`text-xs sm:text-[13px] font-medium transition-colors duration-200 whitespace-nowrap ${
              status === 'running'
                ? 'text-blue-600 dark:text-blue-400'
                : status === 'paused'
                ? 'text-slate-600 dark:text-slate-300'
                : 'text-slate-400 dark:text-slate-400'
            }`}
          >
            {getStatusLabel()}
          </span>
        </div>
      </div>
    </div>
  );
};

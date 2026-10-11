import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, ArrowRight } from 'lucide-react';

interface AntiQuitShieldModalProps {
  isOpen: boolean;
  onCancelExit: () => void;
  onConfirmExit: () => void;
  studiedSeconds: number;
  targetSeconds: number;
  subjectName: string;
}

export const AntiQuitShieldModal: React.FC<AntiQuitShieldModalProps> = ({
  isOpen,
  onCancelExit,
  onConfirmExit,
  studiedSeconds,
  targetSeconds,
  subjectName,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(10);

  useEffect(() => {
    if (!isOpen) {
      setSecondsRemaining(10);
      return;
    }

    setSecondsRemaining(10);
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const studiedMinutes = Math.floor(studiedSeconds / 60);
  const targetMinutes = Math.floor(targetSeconds / 60);
  const remainingMinutes = Math.max(0, targetMinutes - studiedMinutes);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="درع الانضباط الصارم"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
    >
      <div className="w-full max-w-md bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200 dark:border-slate-700/80 p-6 sm:p-7 shadow-2xl relative overflow-hidden transition-all text-center">
        {/* Glow corner */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-12 -left-12 w-36 h-36 rounded-full bg-blue-500/15 dark:bg-blue-400/20 blur-2xl"
        />

        {/* Shield Icon Badge */}
        <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-900/60 mx-auto flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
          <ShieldAlert className="w-7 h-7" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-slate-950 dark:text-slate-100 tracking-tight">
          درع الانضباط الصارم 🛡️
        </h3>

        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          تنفس بعمق.. لقد أنجزت <span className="font-bold text-blue-600 dark:text-blue-400">{studiedMinutes} دقيقة</span> من أصل{' '}
          <span className="font-bold">{targetMinutes} دقيقة</span> في مادة{' '}
          <span className="font-bold text-slate-900 dark:text-white">«{subjectName}»</span>.
        </p>

        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          تبقى لك فقط {remainingMinutes} دقيقة لتنهي جلسة التركيز كاملة وتفي بوعدك لنفسك.
        </p>

        {/* 10-Second Cooldown Visual Circle */}
        <div className="my-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-blue-600 dark:border-blue-400 flex items-center justify-center font-timer text-lg font-bold text-blue-600 dark:text-blue-400">
            {secondsRemaining}
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              {secondsRemaining > 0 ? 'مهلة الـ 10 ثوانٍ لكسر اندفاع الانسحاب' : 'يمكنك الآن اتخاذ القرار'}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {secondsRemaining > 0
                ? 'لحظات التعب هي التي تُفرّق بين الإنسان العادي والمحارب'
                : 'إذا كنت مضطراً حقاً يمكنك الإيقاف وحفظ ما درسته'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Main Action: Stay in the fight! */}
          <button
            type="button"
            onClick={onCancelExit}
            className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>استمر ولا تستسلم 🔥</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>

          {/* Secondary Action: Quit if cooldown done */}
          <button
            type="button"
            disabled={secondsRemaining > 0}
            onClick={onConfirmExit}
            className={`h-12 px-4 rounded-xl border text-xs font-semibold transition-all ${
              secondsRemaining > 0
                ? 'border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed bg-slate-50 dark:bg-slate-900/40'
                : 'border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
            }`}
          >
            {secondsRemaining > 0 ? `انتظر (${secondsRemaining})` : 'إنهاء وحفظ ما درست'}
          </button>
        </div>
      </div>
    </div>
  );
};

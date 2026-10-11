import React, { useState, useEffect } from 'react';
import { Clock, Info } from 'lucide-react';

function calculateCalendarDaysRemaining(nowMs: number): number {
  const now = new Date(nowMs);
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  // Target Exam Date: 01 June 2027 (month index 5)
  const examMidnight = new Date(2027, 5, 1).getTime();
  const diffMs = examMidnight - todayMidnight;
  if (diffMs <= 0) return 0;
  return Math.round(diffMs / 86400000);
}

function formatDaysLabel(days: number): { numberPart: string | null; unitPart: string } {
  if (days === 1) {
    return { numberPart: null, unitPart: 'يوم واحد' };
  }
  if (days === 2) {
    return { numberPart: null, unitPart: 'يومان' };
  }
  if (days >= 3 && days <= 10) {
    return { numberPart: String(days), unitPart: 'أيام' };
  }
  return { numberPart: String(days), unitPart: 'يوم' };
}

export const ExamCountdownBadge: React.FC = () => {
  const [daysLeft, setDaysLeft] = useState<number>(() =>
    calculateCalendarDaysRemaining(Date.now())
  );
  const [showRealityTooltip, setShowRealityTooltip] = useState<boolean>(false);

  useEffect(() => {
    const update = () => {
      setDaysLeft(calculateCalendarDaysRemaining(Date.now()));
    };

    update();
    const intervalId = window.setInterval(update, 10000);

    const handleVisibility = () => {
      update();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
    };
  }, []);

  const isExamReached = daysLeft <= 0;
  const formatted = formatDaysLabel(daysLeft);

  // Realistic study hours estimate (assuming 4 hours of pure focus per day)
  const realisticFocusHours = daysLeft * 4;

  return (
    <div className="relative inline-block select-none">
      <div
        aria-label="عداد الامتحان النهائي"
        onClick={() => setShowRealityTooltip((prev) => !prev)}
        className="cursor-pointer group relative overflow-hidden rounded-2xl bg-white dark:bg-[#1E293B] border border-blue-200/80 dark:border-blue-500/25 shadow-[0_2px_14px_-4px_rgba(37,99,235,0.12)] dark:shadow-[0_2px_16px_-4px_rgba(37,99,235,0.2)] px-3.5 py-1.5 transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-400"
      >
        {/* Whisper-subtle corner blue glow inside the capsule */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-6 -left-6 w-20 h-20 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(37, 99, 235, 0.12) 0%, rgba(255, 255, 255, 0) 72%)',
          }}
        />

        {isExamReached ? (
          <div className="relative z-10 flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap py-0.5">
            <span>اليوم هو موعد الامتحان 🎓</span>
          </div>
        ) : (
          <div className="relative z-10 flex items-center justify-between gap-3.5">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 leading-tight whitespace-nowrap">
                الامتحان النهائي
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-400 font-normal leading-tight whitespace-nowrap mt-0.5">
                01 يونيو 2027
              </span>
            </div>

            <div className="h-5 w-px bg-blue-100 dark:bg-slate-700/80 shrink-0" />

            <div className="flex items-baseline gap-1 whitespace-nowrap">
              <span className="text-[11px] text-slate-400 dark:text-slate-400 font-normal">
                باقي
              </span>
              {formatted.numberPart && (
                <strong className="font-timer font-bold text-sm sm:text-[15px] text-blue-600 dark:text-blue-400">
                  {formatted.numberPart}
                </strong>
              )}
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {formatted.unitPart}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Realistic Hours Tooltip popover */}
      {showRealityTooltip && !isExamReached && (
        <div className="absolute left-0 top-full mt-2 w-64 p-3.5 rounded-2xl bg-slate-900 text-white text-xs shadow-2xl z-40 border border-slate-700 animate-fade-in text-right">
          <div className="flex items-center gap-2 font-bold text-blue-400 mb-1">
            <Clock className="w-4 h-4" />
            <span>الميزان الواقعي للوقت</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            اليوم ليس 24 ساعة دراسة. بمعدل 4 ساعات تركيز يومياً، ما يفصلك عن الامتحان هو حوالي{' '}
            <span className="font-bold text-white font-timer">{realisticFocusHours.toLocaleString('ar-EG')} ساعة دراسية حقيقية</span> فقط.
          </p>
          <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
            كل جلسة 90 دقيقة تنجزها الآن هي لبنة تصنع مستقبلك.
          </div>
        </div>
      )}
    </div>
  );
};

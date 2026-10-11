import React, { useMemo, useState } from 'react';
import { StudySession } from '../types/study';
import { formatDurationArabic, formatDurationClock, toLocalDateKey } from '../utils/format';

interface DisciplineHeatmapProps {
  sessions: StudySession[];
  weeksCount?: number;
}

interface DayData {
  dateKey: string;
  date: Date;
  totalSec: number;
  minutes: number;
  isToday: boolean;
  isFuture: boolean;
  dayOfWeek: number; // 0=Sun, 1=Mon, ..., 6=Sat
}

// Arabic day abbreviations: Sat to Fri
const DAY_LABELS = ['سبت', 'أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة'];

export const DisciplineHeatmap: React.FC<DisciplineHeatmapProps> = ({
  sessions,
  weeksCount = 16, // Shows the last 16 weeks (approx 4 months of relentless consistency)
}) => {
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);

  // Group durations by dateKey
  const sessionMinutesByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of sessions) {
      const current = map.get(s.dateKey) || 0;
      map.set(s.dateKey, current + s.durationSec);
    }
    return map;
  }, [sessions]);

  // Compute the grid of weeks
  // In the Arabic world, weeks traditionally start on Saturday (index 6 in standard JS getDay)
  const { weeks, stats } = useMemo(() => {
    const now = new Date();
    const todayKey = toLocalDateKey(now.getTime());

    // Determine current day of week offset relative to Saturday (0 = Saturday, 1 = Sunday, ..., 6 = Friday)
    // JS getDay(): 0 = Sun, 1 = Mon, ..., 6 = Sat
    const jsDay = now.getDay();
    const dayRelToSat = (jsDay + 1) % 7; // Sat -> 0, Sun -> 1, Mon -> 2, ..., Fri -> 6

    // End date is today (or end of current week)
    // Total days to display: weeksCount * 7
    const totalDays = weeksCount * 7;
    // Calculate the start date of the whole grid so that today sits in the last column
    const startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0);
    // Rewind by (weeksCount - 1) * 7 + dayRelToSat
    startDate.setDate(startDate.getDate() - ((weeksCount - 1) * 7 + dayRelToSat));

    const weeksArray: DayData[][] = [];
    let currentWeek: DayData[] = [];
    const walkDate = new Date(startDate);

    let activeDaysCount = 0;
    let totalGridSec = 0;
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Daily keys set of active days
    const activeDateKeys = new Set<string>();

    for (let i = 0; i < totalDays; i++) {
      const dateKey = toLocalDateKey(walkDate.getTime());
      const totalSec = sessionMinutesByDate.get(dateKey) || 0;
      const minutes = Math.round(totalSec / 60);
      const isToday = dateKey === todayKey;
      const isFuture = walkDate.getTime() > now.getTime();
      const currentJsDay = walkDate.getDay();
      const dayIndexSat = (currentJsDay + 1) % 7;

      if (totalSec > 0 && !isFuture) {
        activeDaysCount++;
        totalGridSec += totalSec;
        activeDateKeys.add(dateKey);
      }

      const dayData: DayData = {
        dateKey,
        date: new Date(walkDate),
        totalSec,
        minutes,
        isToday,
        isFuture,
        dayOfWeek: dayIndexSat,
      };

      currentWeek.push(dayData);

      if (currentWeek.length === 7) {
        weeksArray.push(currentWeek);
        currentWeek = [];
      }

      walkDate.setDate(walkDate.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      weeksArray.push(currentWeek);
    }

    // Calculate streaks from all sessions (checking backwards from today)
    const checkDate = new Date(now);
    checkDate.setHours(0, 0, 0, 0);
    let checkKey = toLocalDateKey(checkDate.getTime());

    // Did user study today?
    const studiedToday = (sessionMinutesByDate.get(checkKey) || 0) > 0;
    if (!studiedToday) {
      // Check yesterday
      checkDate.setDate(checkDate.getDate() - 1);
      checkKey = toLocalDateKey(checkDate.getTime());
    }

    let streakCounter = 0;
    while ((sessionMinutesByDate.get(checkKey) || 0) > 0) {
      streakCounter++;
      checkDate.setDate(checkDate.getDate() - 1);
      checkKey = toLocalDateKey(checkDate.getTime());
    }
    currentStreak = streakCounter;

    // Calculate longest streak across the whole dataset
    // Collect all date keys sorted
    const allUniqueDates = Array.from(sessionMinutesByDate.keys())
      .filter((k) => (sessionMinutesByDate.get(k) || 0) > 0)
      .sort();

    tempStreak = 0;
    let prevMs = 0;
    for (const dKey of allUniqueDates) {
      const parts = dKey.split('-').map(Number);
      const curMs = new Date(parts[0], parts[1] - 1, parts[2]).getTime();
      const oneDayMs = 24 * 60 * 60 * 1000;
      if (prevMs === 0 || Math.round((curMs - prevMs) / oneDayMs) === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
      if (tempStreak > longestStreak) longestStreak = tempStreak;
      prevMs = curMs;
    }
    if (longestStreak < currentStreak) longestStreak = currentStreak;

    return {
      weeks: weeksArray,
      stats: {
        activeDaysCount,
        totalGridSec,
        currentStreak,
        longestStreak,
      },
    };
  }, [sessions, sessionMinutesByDate, weeksCount]);

  // Determine cell color by intensity
  // Tier 0: 0 min (subtle background / no study)
  // Tier 1: 1 - 119 min (less than 2 hours - light tint)
  // Tier 2: 120 - 179 min (2 to 3 hours - minimum discipline benchmark)
  // Tier 3: 180 - 239 min (3 to 4 hours - high focus)
  // Tier 4: 240+ min (4+ hours - maximum royal deep blue discipline!)
  const getCellClasses = (day: DayData) => {
    if (day.isFuture) {
      return 'bg-slate-100/40 dark:bg-slate-800/20 border-dashed border-slate-200/50 dark:border-slate-800/40 cursor-default opacity-40';
    }

    if (day.minutes === 0) {
      return day.isToday
        ? 'bg-slate-100 dark:bg-slate-800/70 border-2 border-blue-500/60 dark:border-blue-400/60'
        : 'bg-slate-100/80 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200/50 dark:border-slate-800/50';
    }

    // Less than 2 hours (< 120 minutes)
    if (day.minutes < 120) {
      return day.isToday
        ? 'bg-blue-200 dark:bg-blue-950/70 border-2 border-blue-400 text-slate-900'
        : 'bg-blue-100 dark:bg-blue-950/50 hover:bg-blue-200 dark:hover:bg-blue-900/60 border border-blue-200/60 dark:border-blue-900/50 text-slate-900 dark:text-slate-200';
    }

    // 2 hours to < 3 hours (120 - 179 minutes) - الحد الأدنى المطلوب للانضباط
    if (day.minutes < 180) {
      return day.isToday
        ? 'bg-blue-400 dark:bg-blue-800 border-2 border-blue-500 text-white shadow-sm'
        : 'bg-blue-300 dark:bg-blue-800/80 hover:bg-blue-400 dark:hover:bg-blue-700 border border-blue-300/50 dark:border-blue-700/60 text-slate-900 dark:text-white';
    }

    // 3 hours to < 4 hours (180 - 239 minutes)
    if (day.minutes < 240) {
      return day.isToday
        ? 'bg-blue-600 text-white border-2 border-white dark:border-blue-300 shadow-sm ring-2 ring-blue-500/40'
        : 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-500 border border-blue-500 dark:border-blue-500 text-white';
    }

    // 4 hours and above (>= 240 minutes) - أقصى غمقان وقوة
    return day.isToday
      ? 'bg-blue-800 dark:bg-blue-500 text-white border-2 border-white dark:border-blue-200 shadow-md ring-2 ring-blue-700/60'
      : 'bg-blue-700 dark:bg-blue-500 hover:bg-blue-800 dark:hover:bg-blue-400 border border-blue-800 dark:border-blue-400 text-white';
  };

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 transition-colors duration-200">
      {/* Top Banner: Streak and High-Level Discipline Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
            <h2 className="text-base sm:text-lg font-bold text-slate-950 dark:text-slate-100 tracking-tight">
              خريطة الانضباط الدراسي
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            كل مربع يوثّق جلساتك الحقيقية. الاستمرارية هي التي تصنع التفوق.
          </p>
        </div>

        {/* Streak & Consistency badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40">
            <span className="text-lg leading-none" role="img" aria-label="سلسلة أيام">
              🔥
            </span>
            <div className="text-right">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-none">
                سلسلة الأيام
              </div>
              <div className="text-sm font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                {stats.currentStreak} {stats.currentStreak === 1 ? 'يوم' : stats.currentStreak === 2 ? 'يومان' : 'أيام'} متواصلة
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-lg leading-none" role="img" aria-label="الأيام النشطة">
              📅
            </span>
            <div className="text-right">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-none">
                أيام التركيز
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {stats.activeDaysCount} يوم
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="mt-5 overflow-x-auto pb-2 -mx-2 px-2 no-scrollbar">
        <div className="inline-flex flex-col gap-1.5 min-w-full">
          {/* Day rows with label */}
          <div className="flex gap-2">
            {/* Day name labels (right column in RTL) */}
            <div className="flex flex-col justify-between py-0.5 text-[10px] font-medium text-slate-400 dark:text-slate-500 select-none shrink-0 w-8">
              <span className="h-3.5 leading-3.5">سبت</span>
              <span className="h-3.5 leading-3.5">إثنين</span>
              <span className="h-3.5 leading-3.5">أربعاء</span>
              <span className="h-3.5 leading-3.5">جمعة</span>
            </div>

            {/* Weeks columns */}
            <div className="flex gap-1.5 flex-1">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1.5 shrink-0">
                  {week.map((day) => (
                    <button
                      key={day.dateKey}
                      type="button"
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      onClick={() => setHoveredDay(day)}
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[4px] transition-all transform hover:scale-125 focus:outline-none ${getCellClasses(
                        day
                      )}`}
                      aria-label={`${day.dateKey}: ${day.minutes} دقيقة`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend & Dynamic Day Details Strip */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Dynamic Detail of hovered day */}
        <div className="text-slate-600 dark:text-slate-300 font-medium h-5 flex items-center">
          {hoveredDay ? (
            <span className="inline-flex items-center gap-2">
              <span className="font-semibold text-slate-900 dark:text-white">
                {hoveredDay.date.toLocaleDateString('ar-EG', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              <span className="text-slate-400">•</span>
              {hoveredDay.totalSec > 0 ? (
                <span className="text-blue-600 dark:text-blue-400 font-bold">
                  {formatDurationArabic(hoveredDay.totalSec)} ({formatDurationClock(hoveredDay.totalSec)})
                </span>
              ) : (
                <span className="text-slate-400">لا توجد دراسة مسجلة</span>
              )}
            </span>
          ) : (
            <span className="text-slate-400 dark:text-slate-500">
              مرّر الفأرة أو المس أي مربع لعرض تفاصيل ذلك اليوم
            </span>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
          <span>أقل (0د)</span>
          <div className="flex items-center gap-1">
            <span
              className="w-3 h-3 rounded-[3px] bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60"
              title="0 دقيقة (لم تدرس)"
            />
            <span
              className="w-3 h-3 rounded-[3px] bg-blue-100 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900/50"
              title="أقل من ساعتين (< 120 دقيقة)"
            />
            <span
              className="w-3 h-3 rounded-[3px] bg-blue-300 dark:bg-blue-800/80 border border-blue-400/50 dark:border-blue-700/50"
              title="ساعتان إلى 3 ساعات (120 - 179 دقيقة - بداية الانضباط الجاد)"
            />
            <span
              className="w-3 h-3 rounded-[3px] bg-blue-500 dark:bg-blue-600 text-white"
              title="3 إلى 4 ساعات (180 - 239 دقيقة - تركيز قوي)"
            />
            <span
              className="w-3 h-3 rounded-[3px] bg-blue-700 dark:bg-blue-500 text-white shadow-sm"
              title="4 ساعات فما فوق (أقصى غمقان وقوة - مستوى الوحش 🔥)"
            />
          </div>
          <span>أقوى (4 ساعات وفوق)</span>
        </div>
      </div>
    </div>
  );
};

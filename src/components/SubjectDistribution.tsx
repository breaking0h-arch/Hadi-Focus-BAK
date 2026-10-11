import React, { useMemo } from 'react';
import { StudySession, Subject } from '../types/study';
import { formatDurationArabic, formatDurationClock } from '../utils/format';

interface SubjectDistributionProps {
  sessions: StudySession[];
  subjects: Subject[];
}

interface SubjectStat {
  id: string;
  name: string;
  totalSec: number;
  percentage: number;
  sessionsCount: number;
}

// Sophisticated color accents for subject distribution bars
const SUBJECT_COLORS = [
  'bg-blue-600 dark:bg-blue-500',
  'bg-indigo-600 dark:bg-indigo-500',
  'bg-sky-500 dark:bg-sky-400',
  'bg-slate-700 dark:bg-slate-400',
  'bg-teal-600 dark:bg-teal-500',
  'bg-violet-600 dark:bg-violet-500',
];

export const SubjectDistribution: React.FC<SubjectDistributionProps> = ({
  sessions,
  subjects,
}) => {
  const { stats, totalSec } = useMemo(() => {
    let sumSec = 0;
    const map = new Map<string, { totalSec: number; count: number }>();

    for (const s of sessions) {
      sumSec += s.durationSec;
      const cur = map.get(s.subjectName) || { totalSec: 0, count: 0 };
      map.set(s.subjectName, {
        totalSec: cur.totalSec + s.durationSec,
        count: cur.count + 1,
      });
    }

    const list: SubjectStat[] = [];
    for (const [name, data] of map.entries()) {
      const percentage = sumSec > 0 ? (data.totalSec / sumSec) * 100 : 0;
      list.push({
        id: name,
        name,
        totalSec: data.totalSec,
        percentage,
        sessionsCount: data.count,
      });
    }

    // Sort by duration descending
    list.sort((a, b) => b.totalSec - a.totalSec);

    return { stats: list, totalSec: sumSec };
  }, [sessions]);

  if (sessions.length === 0 || totalSec === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 transition-colors duration-200">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <h3 className="text-base font-bold text-slate-950 dark:text-slate-100 tracking-tight">
            توزيع الجهد الدراسي حسب المواد
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            مجموع ما درسته: {formatDurationArabic(totalSec)} ({formatDurationClock(totalSec)})
          </p>
        </div>
        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40">
          {stats.length} {stats.length === 1 ? 'مادة' : 'مواد'}
        </span>
      </div>

      {/* Multi-segmented progress bar */}
      <div className="mt-4 h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-0.5 p-0.5">
        {stats.map((stat, idx) => (
          <div
            key={stat.id}
            style={{ width: `${Math.max(stat.percentage, 2)}%` }}
            className={`h-full rounded-sm transition-all duration-300 ${
              SUBJECT_COLORS[idx % SUBJECT_COLORS.length]
            }`}
            title={`${stat.name}: ${stat.percentage.toFixed(1)}%`}
          />
        ))}
      </div>

      {/* Subject rows */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {stats.map((stat, idx) => (
          <div
            key={stat.id}
            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/40 dark:border-slate-800/60"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  SUBJECT_COLORS[idx % SUBJECT_COLORS.length]
                }`}
              />
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {stat.name}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {formatDurationArabic(stat.totalSec)}
              </span>
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 tabular-nums">
                {stat.percentage.toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

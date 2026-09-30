import React, { useMemo, useState } from 'react';
import { Trash2, ArrowLeft } from 'lucide-react';
import { StudySession, Subject } from '../types/study';
import {
  formatDateGroupLabel,
  formatDurationArabic,
  formatDurationClock,
  formatShortDateArabic,
  formatShortDurationArabic,
  formatTimeOfDayArabic,
  toLocalDateKey,
} from '../utils/format';

interface StudyLogViewProps {
  sessions: StudySession[];
  subjects: Subject[];
  onDeleteSession: (id: string) => void;
  onNavigateHome: () => void;
}

export const StudyLogView: React.FC<StudyLogViewProps> = ({
  sessions,
  subjects,
  onDeleteSession,
  onNavigateHome,
}) => {
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');

  // Compute simple honest statistics: Today, This Week, Total Sessions
  const stats = useMemo(() => {
    const now = Date.now();
    const todayKey = toLocalDateKey(now);

    const weekStart = new Date(now);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - 6);
    const weekStartMs = weekStart.getTime();

    let todaySec = 0;
    let weekSec = 0;

    for (const s of sessions) {
      if (s.dateKey === todayKey) {
        todaySec += s.durationSec;
      }
      if (s.startedAt >= weekStartMs) {
        weekSec += s.durationSec;
      }
    }

    return {
      todaySec,
      weekSec,
      totalCount: sessions.length,
    };
  }, [sessions]);

  // Filter sessions by selected subject
  const filteredSessions = useMemo(() => {
    const sorted = [...sessions].sort((a, b) => b.startedAt - a.startedAt);
    if (selectedSubjectFilter === 'all') return sorted;
    return sorted.filter(
      (s) => s.subjectId === selectedSubjectFilter || s.subjectName === selectedSubjectFilter
    );
  }, [sessions, selectedSubjectFilter]);

  // Group sessions by dateKey
  const groupedByDate = useMemo(() => {
    const groups: { dateKey: string; label: string; totalDaySec: number; items: StudySession[] }[] = [];
    const map = new Map<string, StudySession[]>();

    for (const s of filteredSessions) {
      const list = map.get(s.dateKey) || [];
      list.push(s);
      map.set(s.dateKey, list);
    }

    for (const [dateKey, items] of map.entries()) {
      const totalDaySec = items.reduce((acc, cur) => acc + cur.durationSec, 0);
      groups.push({
        dateKey,
        label: formatDateGroupLabel(dateKey),
        totalDaySec,
        items,
      });
    }

    return groups;
  }, [filteredSessions]);

  const filterOptions = useMemo(() => {
    const seen = new Set<string>();
    const list: { id: string; name: string }[] = [];
    for (const subj of subjects) {
      if (!seen.has(subj.name)) {
        seen.add(subj.name);
        list.push({ id: subj.name, name: subj.name });
      }
    }
    for (const s of sessions) {
      if (!seen.has(s.subjectName)) {
        seen.add(s.subjectName);
        list.push({ id: s.subjectName, name: s.subjectName });
      }
    }
    return list;
  }, [subjects, sessions]);

  return (
    <div className="w-full max-w-3xl mx-auto py-6 sm:py-10 px-4 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 dark:text-slate-100 tracking-tight">
          سجل الدراسة
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          هذا ما درسته فعلًا — توثيق دقيق لكل جلسة تركيز حقيقية.
        </p>
      </div>

      {/* Simple Summary Strip (Today, This Week, Sessions Count) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 relative overflow-hidden transition-colors duration-200">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-10 -left-10 w-28 h-28 rounded-full bg-blue-500/[0.06] dark:bg-blue-500/[0.1] blur-2xl"
          />
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">اليوم</div>
          <div className="text-lg sm:text-xl font-bold text-slate-950 dark:text-slate-100 tracking-tight">
            {formatDurationArabic(stats.todaySec)}
          </div>
          <div
            dir="ltr"
            className="mt-1 text-xs font-timer text-blue-600 dark:text-blue-400 inline-block"
          >
            {formatDurationClock(stats.todaySec)}
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 transition-colors duration-200">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">هذا الأسبوع</div>
          <div className="text-lg sm:text-xl font-bold text-slate-950 dark:text-slate-100 tracking-tight">
            {formatDurationArabic(stats.weekSec)}
          </div>
          <div
            dir="ltr"
            className="mt-1 text-xs font-timer text-slate-400 dark:text-slate-500 inline-block"
          >
            {formatDurationClock(stats.weekSec)}
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 transition-colors duration-200">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">عدد جلسات الدراسة</div>
          <div className="text-lg sm:text-xl font-bold text-slate-950 dark:text-slate-100 tracking-tight tabular-nums-strict">
            {stats.totalCount === 0
              ? 'لا توجد جلسات'
              : stats.totalCount === 1
              ? 'جلسة واحدة'
              : stats.totalCount === 2
              ? 'جلستان'
              : stats.totalCount >= 3 && stats.totalCount <= 10
              ? `${stats.totalCount} جلسات`
              : `${stats.totalCount} جلسة`}
          </div>
          <div className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            محفوظة تلقائيًا
          </div>
        </div>
      </div>

      {/* Subject Filter Bar */}
      {sessions.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-6 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedSubjectFilter('all')}
            className={`h-9 px-3.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              selectedSubjectFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100/80 dark:bg-[#1E293B] text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            كل المواد
          </button>
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSelectedSubjectFilter(opt.id)}
              className={`h-9 px-3.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                selectedSubjectFilter === opt.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100/80 dark:bg-[#1E293B] text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {opt.name}
            </button>
          ))}
        </div>
      )}

      {/* Sessions List Grouped by Date */}
      {groupedByDate.length === 0 ? (
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-10 text-center transition-colors duration-200">
          <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
            لا توجد جلسات دراسة مسجلة بعد
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            اختر المادة من الصفحة الرئيسية وابدأ أول جلسة تركيز ليظهر سجل دراستك الفعلي هنا.
          </p>
          <button
            type="button"
            onClick={onNavigateHome}
            className="mt-5 h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors"
          >
            <span>انتقل إلى المؤقت</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedByDate.map((group) => (
            <section key={group.dateKey} aria-label={group.label}>
              {/* Day Group Header */}
              <div className="flex items-baseline justify-between mb-3 px-1">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {group.label}
                </h2>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  المجموع: {formatDurationArabic(group.totalDaySec)}
                </span>
              </div>

              {/* Day Sessions Table/List */}
              <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden transition-colors duration-200">
                {group.items.map((session) => (
                  <div
                    key={session.id}
                    className="group flex items-center justify-between gap-4 px-5 py-4 hover:bg-blue-50/20 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Right side (in RTL): Subject Name + Time/Date Metadata */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
                        <span className="text-base font-bold text-slate-950 dark:text-slate-100 truncate">
                          {session.subjectName}
                        </span>
                      </div>

                      {/* Clean unboxed metadata with typographic separators */}
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400 pr-4.5">
                        <span>
                          من {formatTimeOfDayArabic(session.startedAt)} إلى{' '}
                          {formatTimeOfDayArabic(session.endedAt)}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{formatShortDateArabic(session.dateKey)}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-600 dark:text-slate-300 font-medium">
                          {formatShortDurationArabic(session.durationSec)}
                        </span>
                      </div>
                    </div>

                    {/* Left side (in RTL): Exact HH:MM:SS Duration + Delete Action */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div
                        dir="ltr"
                        className="font-timer text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400 tracking-tight"
                      >
                        {formatDurationClock(session.durationSec)}
                      </div>

                      <button
                        type="button"
                        onClick={() => onDeleteSession(session.id)}
                        title="حذف الجلسة"
                        aria-label={`حذف جلسة ${session.subjectName}`}
                        className="w-8 h-8 rounded-lg text-slate-300 dark:text-slate-600 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center justify-center transition-colors opacity-80 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

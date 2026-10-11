import React, { useMemo, useState } from 'react';
import { Trash2, ArrowLeft, Check, X } from 'lucide-react';
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
import { DisciplineHeatmap } from './DisciplineHeatmap';
import { SubjectDistribution } from './SubjectDistribution';

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
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // Compute honest statistics: Today, This Week, Total Sessions, and Total Study Hours
  const stats = useMemo(() => {
    const now = Date.now();
    const todayKey = toLocalDateKey(now);

    const weekStart = new Date(now);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - 6);
    const weekStartMs = weekStart.getTime();

    let todaySec = 0;
    let weekSec = 0;
    let allTimeSec = 0;

    for (const s of sessions) {
      allTimeSec += s.durationSec;
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
      allTimeSec,
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
    <div className="w-full max-w-3xl mx-auto py-6 sm:py-10 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 dark:text-slate-100 tracking-tight">
          سجل الدراسة والانضباط
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          توثيق دقيق لكل جلسة تركيز حقيقية وخريطة بصرية تبرز أثر استمراريتك كل يوم.
        </p>
      </div>

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 relative overflow-hidden transition-colors duration-200">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-8 -left-8 w-24 h-24 rounded-full bg-blue-500/[0.08] dark:bg-blue-500/[0.12] blur-xl"
          />
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">اليوم</div>
          <div className="text-base sm:text-lg font-bold text-slate-950 dark:text-slate-100 tracking-tight">
            {formatDurationArabic(stats.todaySec)}
          </div>
          <div
            dir="ltr"
            className="mt-0.5 text-[11px] font-timer text-blue-600 dark:text-blue-400 inline-block"
          >
            {formatDurationClock(stats.todaySec)}
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 transition-colors duration-200">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">هذا الأسبوع</div>
          <div className="text-base sm:text-lg font-bold text-slate-950 dark:text-slate-100 tracking-tight">
            {formatDurationArabic(stats.weekSec)}
          </div>
          <div
            dir="ltr"
            className="mt-0.5 text-[11px] font-timer text-slate-400 dark:text-slate-500 inline-block"
          >
            {formatDurationClock(stats.weekSec)}
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 transition-colors duration-200">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">مجموع الساعات</div>
          <div className="text-base sm:text-lg font-bold text-slate-950 dark:text-slate-100 tracking-tight">
            {formatDurationArabic(stats.allTimeSec)}
          </div>
          <div
            dir="ltr"
            className="mt-0.5 text-[11px] font-timer text-slate-400 dark:text-slate-500 inline-block"
          >
            {formatDurationClock(stats.allTimeSec)}
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 transition-colors duration-200">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">الجلسات المكتملة</div>
          <div className="text-base sm:text-lg font-bold text-slate-950 dark:text-slate-100 tracking-tight tabular-nums">
            {stats.totalCount === 0
              ? '0'
              : stats.totalCount === 1
              ? '1 جلسة'
              : stats.totalCount === 2
              ? 'جلستان'
              : `${stats.totalCount} جلسة`}
          </div>
          <div className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
            محفوظة تلقائيًا
          </div>
        </div>
      </div>

      {/* Discipline Heatmap (The Motivational Daily Grid) */}
      <DisciplineHeatmap sessions={sessions} />

      {/* Subject Distribution (Visual breakdown of study hours by subject) */}
      <SubjectDistribution sessions={sessions} subjects={subjects} />

      {/* Session Logs Section with Subject Filter */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-950 dark:text-slate-100 tracking-tight">
            تفاصيل الجلسات السابقة
          </h2>
        </div>

        {sessions.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-5 no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedSubjectFilter('all')}
              className={`h-8 sm:h-9 px-3.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
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
                className={`h-8 sm:h-9 px-3.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
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
              اختر المادة من الصفحة الرئيسية وابدأ جلسة تركيز 90 دقيقة لتبدأ بتلوين خريطة انضباطك.
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
          <div className="space-y-6">
            {groupedByDate.map((group) => (
              <section key={group.dateKey} aria-label={group.label}>
                {/* Day Group Header */}
                <div className="flex items-baseline justify-between mb-2.5 px-1">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                    {group.label}
                  </h3>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    المجموع: {formatDurationArabic(group.totalDaySec)}
                  </span>
                </div>

                {/* Day Sessions List */}
                <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden transition-colors duration-200">
                  {group.items.map((session) => (
                    <div
                      key={session.id}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 hover:bg-blue-50/20 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Subject Name + Time/Date Metadata */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
                          <span className="text-base font-bold text-slate-950 dark:text-slate-100 truncate">
                            {session.subjectName}
                          </span>
                          {session.taskGoal && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40 truncate max-w-[200px]">
                              «{session.taskGoal}»
                            </span>
                          )}
                        </div>

                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                          <span>{formatShortDateArabic(session.dateKey)}</span>
                          <span>•</span>
                          <span>{formatTimeOfDayArabic(session.startedAt)}</span>
                          <span>•</span>
                          <span>
                            الهدف:{' '}
                            {formatShortDurationArabic(session.targetDurationSec)}
                          </span>
                        </div>
                      </div>

                      {/* Duration Clock + Delete Button */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                        <div className="text-left">
                          <div
                            dir="ltr"
                            className="font-timer text-lg font-bold text-blue-600 dark:text-blue-400"
                          >
                            {formatDurationClock(session.durationSec)}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {formatDurationArabic(session.durationSec)}
                          </div>
                        </div>

                        {pendingDeleteId === session.id ? (
                          <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/60 rounded-xl px-2.5 py-1 text-xs">
                            <span className="text-red-700 dark:text-red-300 font-medium text-[11px] whitespace-nowrap">
                              حذف الجلسة؟
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteSession(session.id);
                                setPendingDeleteId(null);
                              }}
                              title="تأكيد الحذف"
                              className="px-2 py-0.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-[11px] transition-colors flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              <span>نعم</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setPendingDeleteId(null)}
                              title="إلغاء"
                              className="p-1 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setPendingDeleteId(session.id)}
                            title="حذف الجلسة"
                            aria-label="حذف الجلسة"
                            className="p-2 rounded-xl text-slate-300 dark:text-slate-600 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

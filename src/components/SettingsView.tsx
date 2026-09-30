import React, { useState } from 'react';
import { Volume2, VolumeX, Plus, Trash2, RotateCcw, Check } from 'lucide-react';
import { AppSettings, Subject, TimerStatus } from '../types/study';
import { playCompletionChime } from '../utils/sound';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  subjects: Subject[];
  onAddSubject: (name: string) => void;
  onDeleteSubject: (id: string) => void;
  onResetDefaultSubjects: () => void;
  onClearAllSessions: () => void;
  sessionsCount: number;
  timerStatus: TimerStatus;
}

const FOCUS_PRESETS = [15, 25, 30, 45, 50, 60, 90];
const BREAK_PRESETS = [5, 10, 15, 20];

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  subjects,
  onAddSubject,
  onDeleteSubject,
  onResetDefaultSubjects,
  onClearAllSessions,
  sessionsCount,
  timerStatus,
}) => {
  const [newSubjectInput, setNewSubjectInput] = useState('');
  const [confirmClearLog, setConfirmClearLog] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const triggerSavedNotice = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 1800);
  };

  const handleFocusChange = (mins: number) => {
    const clamped = Math.max(1, Math.min(180, mins));
    onUpdateSettings({ ...settings, focusMinutes: clamped });
    triggerSavedNotice();
  };

  const handleBreakChange = (mins: number) => {
    const clamped = Math.max(1, Math.min(60, mins));
    onUpdateSettings({ ...settings, breakMinutes: clamped });
    triggerSavedNotice();
  };

  const handleAddSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSubjectInput.trim();
    if (!trimmed) return;
    onAddSubject(trimmed);
    setNewSubjectInput('');
    triggerSavedNotice();
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-6 sm:py-10 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 dark:text-slate-100 tracking-tight">
            الإعدادات
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            تخصيص أوقات التركيز والاستراحة والصوت والمواد الدراسية.
          </p>
        </div>

        {savedNotice && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-3 py-1.5 rounded-xl border border-blue-100 dark:border-blue-800/60">
            <Check className="w-3.5 h-3.5" />
            <span>تم الحفظ</span>
          </div>
        )}
      </div>

      {/* Section 1: Pomodoro Durations */}
      <section className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-6 transition-colors duration-200">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            أوقات المؤقت (Pomodoro)
          </h2>
          {timerStatus !== 'idle' && (
            <span className="text-xs text-blue-600 dark:text-blue-400">
              ستُطبق المدد الجديدة في الجلسة القادمة
            </span>
          )}
        </div>

        {/* Focus Duration */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label htmlFor="focus-mins-input" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              مدة التركيز (بالدقائق)
            </label>
            <div className="flex items-center gap-2">
              <input
                id="focus-mins-input"
                type="number"
                min={1}
                max={180}
                value={settings.focusMinutes}
                onChange={(e) => handleFocusChange(Number(e.target.value) || 25)}
                className="w-20 h-9 text-center font-timer font-bold text-sm text-slate-950 dark:text-slate-100 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500"
              />
              <span className="text-xs text-slate-500 dark:text-slate-400">دقيقة</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {FOCUS_PRESETS.map((preset) => {
              const isSelected = settings.focusMinutes === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleFocusChange(preset)}
                  className={`h-9 px-3.5 rounded-xl text-xs font-medium transition-colors tabular-nums-strict ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700'
                  }`}
                >
                  {preset} د
                </button>
              );
            })}
          </div>
        </div>

        <hr className="border-slate-100 dark:border-slate-800" />

        {/* Break Duration */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label htmlFor="break-mins-input" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              مدة الاستراحة القصيرة (بالدقائق)
            </label>
            <div className="flex items-center gap-2">
              <input
                id="break-mins-input"
                type="number"
                min={1}
                max={60}
                value={settings.breakMinutes}
                onChange={(e) => handleBreakChange(Number(e.target.value) || 5)}
                className="w-20 h-9 text-center font-timer font-bold text-sm text-slate-950 dark:text-slate-100 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500"
              />
              <span className="text-xs text-slate-500 dark:text-slate-400">دقيقة</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {BREAK_PRESETS.map((preset) => {
              const isSelected = settings.breakMinutes === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleBreakChange(preset)}
                  className={`h-9 px-3.5 rounded-xl text-xs font-medium transition-colors tabular-nums-strict ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700'
                  }`}
                >
                  {preset} د
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 2: Sound Settings */}
      <section className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 transition-colors duration-200">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              صوت نهاية الجلسة
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              تنبيه صوتي هادئ وراقٍ عند اكتمال وقت التركيز أو الاستراحة.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => playCompletionChime(true)}
              className="h-10 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors whitespace-nowrap"
            >
              تجربة الصوت
            </button>

            <button
              type="button"
              onClick={() => {
                onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled });
                triggerSavedNotice();
              }}
              className={`h-10 px-4 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${
                settings.soundEnabled
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {settings.soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>مفعّل</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>مكتوم</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Section 3: Subjects Management */}
      <section className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-5 transition-colors duration-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              المواد الدراسية
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              أضف موادك الخاصة أو احذف المواد غير المستخدمة.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              onResetDefaultSubjects();
              triggerSavedNotice();
            }}
            className="h-9 px-3 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>استعادة الافتراضية</span>
          </button>
        </div>

        {/* Add new subject form */}
        <form onSubmit={handleAddSubjectSubmit} className="flex gap-2">
          <input
            type="text"
            value={newSubjectInput}
            onChange={(e) => setNewSubjectInput(e.target.value)}
            placeholder="أضف مادة جديدة (مثال: أحياء، تاريخ...)"
            maxLength={28}
            className="flex-1 h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
          />
          <button
            type="submit"
            disabled={!newSubjectInput.trim()}
            className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة</span>
          </button>
        </form>

        {/* Current subjects list */}
        <div className="flex flex-wrap gap-2 pt-1">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="inline-flex items-center gap-2 h-9 pr-3.5 pl-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 text-sm text-slate-800 dark:text-slate-200"
            >
              <span>{subject.name}</span>
              {subjects.length > 1 && (
                <button
                  type="button"
                  onClick={() => onDeleteSubject(subject.id)}
                  title={`حذف ${subject.name}`}
                  className="w-6 h-6 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center justify-center transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Section 4: Clear Study Log */}
      <section className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 flex items-center justify-between gap-4 transition-colors duration-200">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            سجل الدراسة المحفوظ
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            يوجد حاليًا {sessionsCount} جلسة مسجلة محليًا في متصفحك.
          </p>
        </div>

        {!confirmClearLog ? (
          <button
            type="button"
            disabled={sessionsCount === 0}
            onClick={() => setConfirmClearLog(true)}
            className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-800/60 hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-40 text-xs font-medium transition-colors whitespace-nowrap"
          >
            مسح السجل بالكامل
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClearAllSessions();
                setConfirmClearLog(false);
                triggerSavedNotice();
              }}
              className="h-9 px-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors whitespace-nowrap"
            >
              تأكيد المسح
            </button>
            <button
              type="button"
              onClick={() => setConfirmClearLog(false)}
              className="h-9 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors whitespace-nowrap"
            >
              إلغاء
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

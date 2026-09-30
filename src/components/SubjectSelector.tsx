import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Check } from 'lucide-react';
import { Subject, TimerStatus } from '../types/study';

interface SubjectSelectorProps {
  subjects: Subject[];
  selectedSubjectId: string;
  onSelectSubject: (id: string) => void;
  onAddSubject: (name: string) => void;
  onDeleteSubject: (id: string) => void;
  timerStatus: TimerStatus;
}

export const SubjectSelector: React.FC<SubjectSelectorProps> = ({
  subjects,
  selectedSubjectId,
  onSelectSubject,
  onAddSubject,
  onDeleteSubject,
  timerStatus,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isManaging, setIsManaging] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSubjectName.trim();
    if (!trimmed) return;
    onAddSubject(trimmed);
    setNewSubjectName('');
    setIsAdding(false);
  };

  const isLocked = timerStatus !== 'idle';

  return (
    <section aria-label="اختيار المادة" className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            اختر المادة
          </h2>
          {isLocked && (
            <span className="text-xs text-blue-600 dark:text-blue-400 font-normal">
              · الجلسة قيد التشغيل
            </span>
          )}
        </div>

        {!isLocked && subjects.length > 1 && (
          <button
            type="button"
            onClick={() => {
              setIsManaging((prev) => !prev);
              setIsAdding(false);
            }}
            className="text-xs font-medium text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors duration-150 whitespace-nowrap py-1 px-2 rounded-md"
          >
            {isManaging ? 'تم' : 'إدارة المواد'}
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {subjects.map((subject) => {
          const isSelected = subject.id === selectedSubjectId;

          return (
            <div key={subject.id} className="relative inline-flex items-center">
              <button
                type="button"
                disabled={isLocked && !isSelected}
                onClick={() => {
                  if (!isLocked) {
                    onSelectSubject(subject.id);
                  }
                }}
                className={`h-10 px-4 rounded-xl text-sm font-medium transition-all duration-150 whitespace-nowrap flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs shadow-blue-600/20'
                    : isLocked
                    ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 border-slate-200/70 dark:border-slate-800 cursor-not-allowed'
                    : 'bg-white dark:bg-[#1E293B] text-slate-700 dark:text-slate-200 border-slate-200/90 dark:border-slate-700/80 hover:border-blue-300 dark:hover:border-blue-500/50 hover:text-slate-950 dark:hover:text-white hover:bg-blue-50/30 dark:hover:bg-blue-950/30 active:scale-[0.98]'
                } ${isManaging && subjects.length > 1 ? 'pl-8' : ''}`}
              >
                <span>{subject.name}</span>
              </button>

              {isManaging && subjects.length > 1 && !isLocked && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSubject(subject.id);
                  }}
                  title={`حذف ${subject.name}`}
                  aria-label={`حذف ${subject.name}`}
                  className={`absolute left-1.5 w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'text-blue-100 hover:text-white hover:bg-blue-700'
                      : 'text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}

        {/* Add Subject Trigger / Inline Form */}
        {!isLocked && !isManaging && (
          <>
            {!isAdding ? (
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="h-10 px-3.5 rounded-xl text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-950/30 hover:bg-blue-50 dark:hover:bg-blue-950/50 border border-blue-200/70 dark:border-blue-800/50 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap active:scale-[0.98]"
              >
                <Plus className="w-4 h-4 stroke-[2.2]" />
                <span>إضافة مادة</span>
              </button>
            ) : (
              <form
                onSubmit={handleAddSubmit}
                className="inline-flex items-center gap-1.5 h-10 bg-white dark:bg-[#1E293B] border border-blue-400 dark:border-blue-500 rounded-xl px-2 shadow-xs shadow-blue-500/10"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setIsAdding(false);
                      setNewSubjectName('');
                    }
                  }}
                  placeholder="مثال: أحياء"
                  maxLength={28}
                  className="w-28 sm:w-36 h-full text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-transparent focus:outline-none px-1.5"
                />
                <button
                  type="submit"
                  disabled={!newSubjectName.trim()}
                  aria-label="تأكيد إضافة المادة"
                  className="h-7 px-2.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors flex items-center gap-1 whitespace-nowrap"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>إضافة</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setNewSubjectName('');
                  }}
                  aria-label="إلغاء"
                  className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </section>
  );
};

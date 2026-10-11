import React from 'react';
import { Target, CheckCircle2, Circle } from 'lucide-react';

interface MicroCommitmentPledgeProps {
  taskGoal: string;
  setTaskGoal: (val: string) => void;
  isStarted: boolean;
  subjectName: string;
}

export const MicroCommitmentPledge: React.FC<MicroCommitmentPledgeProps> = ({
  taskGoal,
  setTaskGoal,
  isStarted,
  subjectName,
}) => {
  if (isStarted) {
    if (!taskGoal.trim()) return null;
    return (
      <div className="w-full max-w-md mx-auto mt-4 px-4 py-2.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-900/40 text-center animate-fade-in">
        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
          <Target className="w-3.5 h-3.5" />
          <span>عهد الجلسة في {subjectName}</span>
        </div>
        <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white truncate">
          « {taskGoal} »
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto mt-4 transition-all">
      <div className="relative">
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
          <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <input
          type="text"
          value={taskGoal}
          onChange={(e) => setTaskGoal(e.target.value)}
          placeholder="ما هو التحدي الذي ستنجزه في هذه الجلسة؟ (اختياري)"
          className="w-full h-11 pr-10 pl-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-[#1E293B]/80 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all shadow-sm"
          maxLength={100}
        />
      </div>
    </div>
  );
};

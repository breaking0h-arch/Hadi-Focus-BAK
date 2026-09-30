import React from 'react';
import { Volume2, VolumeX, Maximize2, Sun, Moon } from 'lucide-react';
import { NavigationTab } from '../types/study';
import { ThemeMode } from '../utils/storage';
import { ExamCountdownBadge } from './ExamCountdownBadge';

interface TopBarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onEnterFullscreen: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onSelectTab,
  soundEnabled,
  onToggleSound,
  theme,
  onToggleTheme,
  onEnterFullscreen,
}) => {
  const navItems: { id: NavigationTab; label: string }[] = [
    { id: 'home', label: 'الرئيسية' },
    { id: 'log', label: 'السجل' },
    { id: 'settings', label: 'الإعدادات' },
  ];

  const isDark = theme === 'dark';

  return (
    <header className="w-full border-b border-slate-100 dark:border-slate-800/90 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md sticky top-0 z-30 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-2.5 md:py-0 md:h-20 flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
        {/* Top Row on Mobile / Right & Center Zones on Desktop */}
        <div className="flex items-center justify-between md:justify-start md:gap-10">
          {/* Zone 1: Single text element wordmark */}
          <button
            type="button"
            onClick={() => onSelectTab('home')}
            className="text-lg sm:text-xl font-bold tracking-tight text-slate-950 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap"
          >
            تركيز
          </button>

          {/* Zone 2: Clean text navigation links */}
          <nav aria-label="التنقل الرئيسي" className="flex items-center gap-5 sm:gap-7">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`relative py-1.5 text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 right-0 left-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Mobile-only quick actions so the top row stays balanced */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              type="button"
              onClick={onToggleTheme}
              title={isDark ? 'الوضع النهاري' : 'الوضع الليلي'}
              aria-label={isDark ? 'الوضع النهاري' : 'الوضع الليلي'}
              className="h-9 w-9 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-[#1E293B] text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onToggleSound}
              title={soundEnabled ? 'كتم صوت نهاية الجلسة' : 'تشغيل صوت نهاية الجلسة'}
              aria-label={soundEnabled ? 'كتم صوت نهاية الجلسة' : 'تشغيل صوت نهاية الجلسة'}
              className={`h-9 w-9 rounded-xl border flex items-center justify-center transition-colors ${
                soundEnabled
                  ? 'border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-[#1E293B]'
                  : 'border-slate-200/60 dark:border-slate-800 text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50'
              }`}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>

            <button
              type="button"
              onClick={onEnterFullscreen}
              title="ملء الشاشة"
              aria-label="ملء الشاشة"
              className="h-9 w-9 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-[#1E293B] text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Left Zone (in RTL): Exam Countdown Capsule + Desktop Actions */}
        <div className="flex items-center justify-between md:justify-end gap-2.5">
          <div className="w-full md:w-auto">
            <ExamCountdownBadge />
          </div>

          <div className="hidden md:flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onToggleTheme}
              title={isDark ? 'الوضع النهاري' : 'الوضع الليلي'}
              aria-label={isDark ? 'الوضع النهاري' : 'الوضع الليلي'}
              className="h-10 w-10 rounded-xl border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-200 dark:hover:border-blue-500/40 bg-white dark:bg-[#1E293B] text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onToggleSound}
              title={soundEnabled ? 'كتم صوت نهاية الجلسة' : 'تشغيل صوت نهاية الجلسة'}
              aria-label={soundEnabled ? 'كتم صوت نهاية الجلسة' : 'تشغيل صوت نهاية الجلسة'}
              className={`h-10 w-10 rounded-xl border flex items-center justify-center transition-colors ${
                soundEnabled
                  ? 'border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-500/40 bg-white dark:bg-[#1E293B]'
                  : 'border-slate-200/60 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 bg-slate-50 dark:bg-slate-800/50'
              }`}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>

            <button
              type="button"
              onClick={onEnterFullscreen}
              className="h-10 px-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-200 dark:hover:border-blue-500/40 bg-white dark:bg-[#1E293B] hover:bg-blue-50/40 dark:hover:bg-blue-950/30 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>ملء الشاشة</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

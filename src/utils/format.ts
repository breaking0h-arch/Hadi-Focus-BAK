/**
 * Formats remaining or elapsed seconds for the main circular timer.
 * Uses MM:SS for up to 99 minutes (e.g. 25:00, 24:59, 01:00, 00:00)
 * so the 5-character geometry stays 100% consistent inside the circle.
 */
export function formatTimerDigits(totalSeconds: number): string {
  const safeSec = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safeSec / 60);
  const secs = safeSec % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Formats a session duration as HH:MM:SS for the Study Log (e.g. 01:25:32, 00:52:10).
 */
export function formatDurationClock(totalSeconds: number): string {
  const safeSec = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSec / 3600);
  const mins = Math.floor((safeSec % 3600) / 60);
  const secs = safeSec % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Formats duration in clean, natural Arabic prose.
 * Examples:
 * - "3 ساعات و25 دقيقة"
 * - "ساعة واحدة و15 دقيقة"
 * - "25 دقيقة"
 * - "45 ثانية"
 */
export function formatDurationArabic(totalSeconds: number): string {
  const safeSec = Math.max(0, Math.floor(totalSeconds));
  if (safeSec === 0) return '0 دقيقة';

  const hours = Math.floor(safeSec / 3600);
  const mins = Math.floor((safeSec % 3600) / 60);
  const secs = safeSec % 60;

  const parts: string[] = [];

  if (hours > 0) {
    if (hours === 1) parts.push('ساعة واحدة');
    else if (hours === 2) parts.push('ساعتان');
    else if (hours >= 3 && hours <= 10) parts.push(`${hours} ساعات`);
    else parts.push(`${hours} ساعة`);
  }

  if (mins > 0) {
    if (mins === 1) parts.push('دقيقة واحدة');
    else if (mins === 2) parts.push('دقيقتان');
    else if (mins >= 3 && mins <= 10) parts.push(`${mins} دقائق`);
    else parts.push(`${mins} دقيقة`);
  }

  if (hours === 0 && mins === 0 && secs > 0) {
    if (secs >= 3 && secs <= 10) return `${secs} ثوانٍ`;
    return `${secs} ثانية`;
  }

  return parts.join(' و');
}

/**
 * Short Arabic duration badge for inline display (e.g. "25 دقيقة", "1 س و 25 د").
 */
export function formatShortDurationArabic(totalSeconds: number): string {
  const safeSec = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSec / 3600);
  const mins = Math.floor((safeSec % 3600) / 60);
  const secs = safeSec % 60;

  if (hours > 0 && mins > 0) {
    return `${hours} س و${mins} د`;
  }
  if (hours > 0) {
    return `${hours} ساعة`;
  }
  if (mins > 0) {
    return `${mins} دقيقة`;
  }
  return `${secs} ثانية`;
}

/**
 * Returns local YYYY-MM-DD key for a timestamp.
 */
export function toLocalDateKey(timestamp: number): string {
  const d = new Date(timestamp);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats an epoch timestamp (ms) into 12-hour time with Arabic AM/PM (e.g. "09:45 ص").
 */
export function formatTimeOfDayArabic(timestamp: number): string {
  const d = new Date(timestamp);
  const hours24 = d.getHours();
  const mins = String(d.getMinutes()).padStart(2, '0');
  const period = hours24 >= 12 ? 'م' : 'ص';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${String(hours12).padStart(2, '0')}:${mins} ${period}`;
}

/**
 * Formats a YYYY-MM-DD date key into a clean Arabic header ("اليوم", "أمس", or full date).
 */
export function formatDateGroupLabel(dateKey: string): string {
  const todayKey = toLocalDateKey(Date.now());
  if (dateKey === todayKey) return 'اليوم';

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateKey === toLocalDateKey(yesterday.getTime())) return 'أمس';

  const [year, month, day] = dateKey.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat('ar-EG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(dateObj);
}

/**
 * Formats a YYYY-MM-DD date key into a short readable Arabic date (e.g. "29 سبتمبر 2026").
 */
export function formatShortDateArabic(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat('ar-EG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(dateObj);
}

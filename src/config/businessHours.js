/**
 * SOFT 3D Operating & Business Hours Configuration
 * Centralized, type-safe business hours configuration with defensive null/undefined handling.
 */

export const businessHours = {
  days: 'Mon - Fri',
  workdays: 'Monday – Friday',
  startTime: '08:30',
  endTime: '17:30',
  timezone: 'CET',
  display: '08:30 – 17:30 CET',
  compactDisplay: '8:30 - 17:30 CET',
  fullSchedule: 'Mon - Fri: 08:30 - 17:30 CET',
  responseTimeHours: 24,
  emergencySupport: '24/7 contracted SLA partners',
  schedule: {
    workdays: 'Monday – Friday',
    startTime: '08:30',
    endTime: '17:30',
    display: '08:30 – 17:30 CET',
    compactDisplay: '8:30 - 17:30 CET'
  }
};

export const businessHoursConfig = businessHours;

/**
 * Safely formats business hours with fallback defaults
 * @param {Object} [config] 
 * @returns {string} Formatted string like "08:30 – 17:30 CET"
 */
export function getFormattedBusinessHours(config = businessHours) {
  if (!config) {
    return '08:30 – 17:30 CET';
  }
  const schedule = config.schedule || config;
  const start = schedule?.startTime ?? '08:30';
  const end = schedule?.endTime ?? '17:30';
  const tz = config?.timezone ?? schedule?.timezone ?? 'CET';
  return `${start} – ${end} ${tz}`;
}

/**
 * Checks if the business is currently open in CET timezone
 * @param {Date} [now]
 * @param {Object} [config]
 * @returns {boolean}
 */
export function isCurrentlyOpen(now = new Date(), config = businessHours) {
  try {
    const day = now.getDay();
    if (day === 0 || day === 6) return false;

    const schedule = config?.schedule || config;
    const startTime = schedule?.startTime || '08:30';
    const endTime = schedule?.endTime || '17:30';

    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    const currentMins = now.getHours() * 60 + now.getMinutes();
    const startMins = (startH || 8) * 60 + (startM || 30);
    const endMins = (endH || 17) * 60 + (endM || 30);

    return currentMins >= startMins && currentMins <= endMins;
  } catch {
    return false;
  }
}

export default businessHours;

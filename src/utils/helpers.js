// Time zone database with city, country, and IANA timezone identifier
export const TIMEZONES = [
  { city: 'New York', country: 'United States', timezone: 'America/New_York', flag: '🇺🇸' },
  { city: 'Los Angeles', country: 'United States', timezone: 'America/Los_Angeles', flag: '🇺🇸' },
  { city: 'Chicago', country: 'United States', timezone: 'America/Chicago', flag: '🇺🇸' },
  { city: 'Denver', country: 'United States', timezone: 'America/Denver', flag: '🇺🇸' },
  { city: 'Honolulu', country: 'United States', timezone: 'Pacific/Honolulu', flag: '🇺🇸' },
  { city: 'Anchorage', country: 'United States', timezone: 'America/Anchorage', flag: '🇺🇸' },
  { city: 'London', country: 'United Kingdom', timezone: 'Europe/London', flag: '🇬🇧' },
  { city: 'Paris', country: 'France', timezone: 'Europe/Paris', flag: '🇫🇷' },
  { city: 'Berlin', country: 'Germany', timezone: 'Europe/Berlin', flag: '🇩🇪' },
  { city: 'Rome', country: 'Italy', timezone: 'Europe/Rome', flag: '🇮🇹' },
  { city: 'Madrid', country: 'Spain', timezone: 'Europe/Madrid', flag: '🇪🇸' },
  { city: 'Amsterdam', country: 'Netherlands', timezone: 'Europe/Amsterdam', flag: '🇳🇱' },
  { city: 'Moscow', country: 'Russia', timezone: 'Europe/Moscow', flag: '🇷🇺' },
  { city: 'Istanbul', country: 'Turkey', timezone: 'Europe/Istanbul', flag: '🇹🇷' },
  { city: 'Dubai', country: 'UAE', timezone: 'Asia/Dubai', flag: '🇦🇪' },
  { city: 'Riyadh', country: 'Saudi Arabia', timezone: 'Asia/Riyadh', flag: '🇸🇦' },
  { city: 'Karachi', country: 'Pakistan', timezone: 'Asia/Karachi', flag: '🇵🇰' },
  { city: 'Mumbai', country: 'India', timezone: 'Asia/Kolkata', flag: '🇮🇳' },
  { city: 'Delhi', country: 'India', timezone: 'Asia/Kolkata', flag: '🇮🇳' },
  { city: 'Dhaka', country: 'Bangladesh', timezone: 'Asia/Dhaka', flag: '🇧🇩' },
  { city: 'Bangkok', country: 'Thailand', timezone: 'Asia/Bangkok', flag: '🇹🇭' },
  { city: 'Singapore', country: 'Singapore', timezone: 'Asia/Singapore', flag: '🇸🇬' },
  { city: 'Hong Kong', country: 'China', timezone: 'Asia/Hong_Kong', flag: '🇭🇰' },
  { city: 'Shanghai', country: 'China', timezone: 'Asia/Shanghai', flag: '🇨🇳' },
  { city: 'Beijing', country: 'China', timezone: 'Asia/Shanghai', flag: '🇨🇳' },
  { city: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo', flag: '🇯🇵' },
  { city: 'Seoul', country: 'South Korea', timezone: 'Asia/Seoul', flag: '🇰🇷' },
  { city: 'Sydney', country: 'Australia', timezone: 'Australia/Sydney', flag: '🇦🇺' },
  { city: 'Melbourne', country: 'Australia', timezone: 'Australia/Melbourne', flag: '🇦🇺' },
  { city: 'Auckland', country: 'New Zealand', timezone: 'Pacific/Auckland', flag: '🇳🇿' },
  { city: 'Sao Paulo', country: 'Brazil', timezone: 'America/Sao_Paulo', flag: '🇧🇷' },
  { city: 'Buenos Aires', country: 'Argentina', timezone: 'America/Argentina/Buenos_Aires', flag: '🇦🇷' },
  { city: 'Mexico City', country: 'Mexico', timezone: 'America/Mexico_City', flag: '🇲🇽' },
  { city: 'Toronto', country: 'Canada', timezone: 'America/Toronto', flag: '🇨🇦' },
  { city: 'Vancouver', country: 'Canada', timezone: 'America/Vancouver', flag: '🇨🇦' },
  { city: 'Cairo', country: 'Egypt', timezone: 'Africa/Cairo', flag: '🇪🇬' },
  { city: 'Lagos', country: 'Nigeria', timezone: 'Africa/Lagos', flag: '🇳🇬' },
  { city: 'Nairobi', country: 'Kenya', timezone: 'Africa/Nairobi', flag: '🇰🇪' },
  { city: 'Johannesburg', country: 'South Africa', timezone: 'Africa/Johannesburg', flag: '🇿🇦' },
  { city: 'Kathmandu', country: 'Nepal', timezone: 'Asia/Kathmandu', flag: '🇳🇵' },
  { city: 'Jakarta', country: 'Indonesia', timezone: 'Asia/Jakarta', flag: '🇮🇩' },
  { city: 'Kuala Lumpur', country: 'Malaysia', timezone: 'Asia/Kuala_Lumpur', flag: '🇲🇾' },
  { city: 'Manila', country: 'Philippines', timezone: 'Asia/Manila', flag: '🇵🇭' },
  { city: 'Taipei', country: 'Taiwan', timezone: 'Asia/Taipei', flag: '🇹🇼' },
  { city: 'Colombo', country: 'Sri Lanka', timezone: 'Asia/Colombo', flag: '🇱🇰' },
];

export const DAYS_OF_WEEK = [
  { key: 'sun', label: 'Sunday', short: 'Sun', letter: 'S' },
  { key: 'mon', label: 'Monday', short: 'Mon', letter: 'M' },
  { key: 'tue', label: 'Tuesday', short: 'Tue', letter: 'T' },
  { key: 'wed', label: 'Wednesday', short: 'Wed', letter: 'W' },
  { key: 'thu', label: 'Thursday', short: 'Thu', letter: 'T' },
  { key: 'fri', label: 'Friday', short: 'Fri', letter: 'F' },
  { key: 'sat', label: 'Saturday', short: 'Sat', letter: 'S' },
];

export const ALARM_SOUNDS = [
  { id: 'default', name: 'Default', file: null },
  { id: 'gentle', name: 'Gentle Wake', file: null },
  { id: 'classic', name: 'Classic Bell', file: null },
  { id: 'digital', name: 'Digital Beep', file: null },
  { id: 'nature', name: 'Nature Sound', file: null },
  { id: 'melody', name: 'Morning Melody', file: null },
];

export const formatTime = (date, use24Hour = false, showSeconds = true) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  if (use24Hour) {
    const h = String(hours).padStart(2, '0');
    const m = String(minutes).padStart(2, '0');
    const s = String(seconds).padStart(2, '0');
    return showSeconds ? `${h}:${m}:${s}` : `${h}:${m}`;
  }

  const period = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  const h = String(h12).padStart(2, '0');
  const m = String(minutes).padStart(2, '0');
  const s = String(seconds).padStart(2, '0');
  return showSeconds ? `${h}:${m}:${s} ${period}` : `${h}:${m} ${period}`;
};

export const formatTimeForTimezone = (timezone, use24Hour = false) => {
  const now = new Date();
  const options = {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: !use24Hour,
  };
  return now.toLocaleTimeString('en-US', options);
};

export const getTimezoneOffset = (timezone) => {
  const now = new Date();
  const localTime = now.getTime();
  const localOffset = now.getTimezoneOffset() * 60000;
  const utc = localTime + localOffset;

  const targetTime = new Date(
    utc + getTimezoneOffsetMs(timezone)
  );
  const diffMs = targetTime.getTime() - now.getTime();
  const diffHours = Math.round(diffMs / 3600000);

  if (diffHours === 0) return 'Same time';
  const sign = diffHours > 0 ? '+' : '';
  return `${sign}${diffHours}h`;
};

const getTimezoneOffsetMs = (timezone) => {
  const date = new Date();
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  return tzDate.getTime() - utcDate.getTime();
};

export const padZero = (num) => String(num).padStart(2, '0');

export const formatStopwatchTime = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((ms % 1000) / 10);
  return `${padZero(minutes)}:${padZero(seconds)}.${padZero(centiseconds)}`;
};

export const formatTimerDisplay = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
};

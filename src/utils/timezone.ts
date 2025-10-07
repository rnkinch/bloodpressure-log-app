/**
 * Utility functions for handling timezone conversions
 */

/**
 * Converts a Date object to a local datetime-local input value
 * This ensures the datetime-local input shows the correct local time
 */
export const toLocalDateTimeString = (date: Date): string => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
};

/**
 * Converts a local datetime-local input value back to a Date object
 * This ensures the Date object represents the correct local time
 */
export const fromLocalDateTimeString = (localDateTimeString: string): Date => {
  return new Date(localDateTimeString);
};

/**
 * Gets the current local time as a datetime-local input value
 */
export const getCurrentLocalDateTime = (): string => {
  return toLocalDateTimeString(new Date());
};

/**
 * Formats a date for display in charts, respecting local timezone
 */
export const formatForDisplay = (date: Date): string => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Gets a datetime-local string for a time in the past
 */
export const getTimeAgo = (amount: number, unit: 'hour' | 'day' | 'week'): string => {
  const now = new Date();
  let pastTime: Date;
  
  switch (unit) {
    case 'hour':
      pastTime = new Date(now.getTime() - amount * 60 * 60 * 1000);
      break;
    case 'day':
      pastTime = new Date(now.getTime() - amount * 24 * 60 * 60 * 1000);
      break;
    case 'week':
      pastTime = new Date(now.getTime() - amount * 7 * 24 * 60 * 60 * 1000);
      break;
    default:
      pastTime = now;
  }
  
  return toLocalDateTimeString(pastTime);
};

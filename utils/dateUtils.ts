
/**
 * Zimbabwean Standard Time (CAT) is always UTC+2
 */

export const getHarareISOString = () => {
  const now = new Date();
  const offset = 2 * 60; // Harare is UTC+2
  const harareTime = new Date(now.getTime() + (offset + now.getTimezoneOffset()) * 60000);
  return harareTime.toISOString();
};

export const formatHarareDate = (isoString: string) => {
  const date = new Date(isoString);
  // Using Intl to ensure we see Harare time regardless of where the browser is
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Harare',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date); // Returns YYYY-MM-DD
};

export const getHarareDisplayDate = (isoString: string) => {
  return new Date(isoString).toLocaleDateString('en-GB', {
    timeZone: 'Africa/Harare',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const getHarareDayName = (isoString: string) => {
  return new Date(isoString).toLocaleDateString('en-US', {
    timeZone: 'Africa/Harare',
    weekday: 'long'
  });
};

export const getHarareDayNum = (isoString: string) => {
  return new Date(isoString).toLocaleDateString('en-US', {
    timeZone: 'Africa/Harare',
    day: 'numeric'
  });
};

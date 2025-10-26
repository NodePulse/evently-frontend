export const toUTCISOString = (date: Date | null) => {
  if (!date) return null;
  // Convert local (IST) time to UTC string
  return new Date(date.getTime() - date.getTimezoneOffset()).toISOString();
};

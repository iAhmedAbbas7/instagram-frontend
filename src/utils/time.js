// <= SHORT RELATIVE TIME HELPER FUNCTION =>

export const getShortRelativeTime = (date) => {
  // CURRENT TIME FOR COMPARISON
  const now = Date.now();
  // DATE TO BE PROCESSED
  const createdAt = new Date(date).getTime();
  // CALCULATING DIFFERENCE IN SECONDS
  const differenceInSeconds = Math.floor((now - createdAt) / 1_000);
  // CALCULATING DIFFERENCE IN MINUTES
  const differenceInMinutes = Math.floor(differenceInSeconds / 60);
  // CALCULATING DIFFERENCE IN HOURS
  const differenceInHours = Math.floor(differenceInMinutes / 60);
  // CALCULATING DIFFERENCE IN DAYS
  const differenceInDays = Math.floor(differenceInHours / 24);
  // IF TIME IS LESS THEN A MINUTE, THEN SENDING TIME IN SECONDS
  if (differenceInSeconds < 60) {
    return `${differenceInSeconds}s`;
  }
  // IF TIME IS LESS THAN AN HOUR, THEN SENDING TIME IN MINUTES
  if (differenceInMinutes < 60) {
    return `${differenceInMinutes}m`;
  }
  // IF TIME IS LESS THEN A DAY, THEN SENDING TIME IN HOURS
  if (differenceInHours < 24) {
    return `${differenceInHours}h`;
  }
  // IF TIME IS MORE THAN A DAY, THEN SENDING TIME IN DAYS
  return `${differenceInDays}d`;
};

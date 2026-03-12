/*
========================
GET TODAY DATE
========================
*/
export const getToday = () => {
  return new Date().toISOString().split("T")[0];
};

/*
========================
FORMAT DATE (YYYY-MM-DD → DD/MM/YYYY)
========================
*/
export const formatDate = (dateString) => {
  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

/*
========================
GET DAYS BETWEEN 2 DATES
========================
*/
export const getDaysBetween = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  const diff = d2 - d1;

  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

/*
========================
CHECK IF TIMEOUT
========================
*/
export const isTimeout = (lastCheckin, timeoutDays) => {
  if (!lastCheckin) return true;

  const today = new Date();
  const last = new Date(lastCheckin);

  const diff = today - last;
  const diffDays = diff / (1000 * 60 * 60 * 24);

  return diffDays > timeoutDays;
};

/*
========================
ADD DAYS
========================
*/
export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);

  return result.toISOString().split("T")[0];
};

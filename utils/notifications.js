/*
========================
SHOW SIMPLE ALERT
========================
*/
export const showNotification = (title, message) => {
  alert(`${title}\n\n${message}`);
};


/*
========================
CHECK CHECKIN WARNING
========================
*/
export const checkCheckinWarning = (lastCheckin, timeoutDays) => {

  if (!lastCheckin) {
    return {
      warning: true,
      message: "You have not checked in yet."
    };
  }

  const today = new Date();
  const last = new Date(lastCheckin);

  const diff = today - last;
  const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (diffDays >= timeoutDays) {
    return {
      warning: true,
      message: "You have not checked in for too long!"
    };
  }

  return {
    warning: false,
    message: null
  };
};


/*
========================
CREATE WARNING MESSAGE
========================
*/
export const createWarningMessage = (days) => {

  return `You have not checked in for ${days} days. Please check in to confirm you are safe.`;
};


/*
========================
CHECK IF NEED NOTIFICATION
========================
*/
export const shouldSendNotification = (lastCheckin, timeoutDays) => {

  if (!lastCheckin) return true;

  const today = new Date();
  const last = new Date(lastCheckin);

  const diff = today - last;
  const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

  return diffDays >= timeoutDays;
};
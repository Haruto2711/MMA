const API_URL = "http://localhost:3000";
const CHECKIN_URL = `${API_URL}/checkins`;
const USERS_URL = `${API_URL}/users`;


/*
========================
CREATE CHECKIN
========================
*/
export const createCheckin = async (userId) => {
  try {

    const today = new Date().toISOString().split("T")[0];

    const res = await fetch(CHECKIN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: userId,
        timestamp: today
      })
    });

    if (!res.ok) {
      throw new Error("Checkin failed");
    }

    // update lastCheckin của user
    await fetch(`${USERS_URL}/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        lastCheckin: today
      })
    });

    return await res.json();

  } catch (error) {
    console.error("Checkin error:", error.message);
    throw error;
  }
};


/*
========================
GET CHECKIN HISTORY
========================
*/
export const getCheckinHistory = async (userId) => {
  try {

    const res = await fetch(`${CHECKIN_URL}?userId=${userId}`);

    if (!res.ok) {
      throw new Error("Cannot load history");
    }

    return await res.json();

  } catch (error) {
    console.error("History error:", error.message);
    throw error;
  }
};


/*
========================
GET LAST CHECKIN
========================
*/
export const getLastCheckin = async (userId) => {
  try {

    const res = await fetch(`${USERS_URL}/${userId}`);
    const user = await res.json();

    return user.lastCheckin;

  } catch (error) {
    console.error("Last checkin error:", error.message);
    throw error;
  }
};


/*
========================
CHECK TIMEOUT
========================
*/
export const checkTimeout = (lastCheckin, timeoutDays) => {

  if (!lastCheckin) return true;

  const last = new Date(lastCheckin);
  const now = new Date();

  const diffTime = now - last;
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  return diffDays > timeoutDays;
};
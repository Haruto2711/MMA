import { Platform } from "react-native";
import { getToday } from "../utils/dateUtils";

const API_URL = "https://mma-db.onrender.com";
const CHECKIN_URL = `${API_URL}/checkins`;
const USERS_URL = `${API_URL}/users`;

const isSameUserId = (value, userId) => String(value) === String(userId);

/*
========================
CREATE CHECKIN
========================
*/
export const createCheckin = async (userId) => {
  try {
    const normalizedUserId = String(userId).trim();
    const today = getToday();

    const allCheckinsRes = await fetch(CHECKIN_URL);
    if (!allCheckinsRes.ok) {
      throw new Error("Cannot load existing checkins");
    }

    const allCheckins = await allCheckinsRes.json();
    const todayCheckins = allCheckins.filter(
      (item) => isSameUserId(item.userId, normalizedUserId) && item.timestamp === today
    );

    if (todayCheckins.length > 0) {
      return {
  message: "Already checked in today"
};
    }

    const maxNumericId = allCheckins.reduce((maxId, item) => {
      const parsedId = Number(item.id);
      if (!Number.isFinite(parsedId)) return maxId;
      return Math.max(maxId, parsedId);
    }, 0);
    const nextId = String(maxNumericId + 1);

    const res = await fetch(CHECKIN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: nextId,
        userId: Number.isNaN(Number(normalizedUserId))
          ? normalizedUserId
          : Number(normalizedUserId),
        timestamp: today,
      }),
    });

    if (!res.ok) {
      throw new Error("Checkin failed");
    }

    // Try update user profile for compatibility with older screens.
    // Do not fail check-in if this route style is unsupported by json-server version.
    try {
      const usersRes = await fetch(`${USERS_URL}?id=${normalizedUserId}`);
      if (usersRes.ok) {
        const users = await usersRes.json();
        if (users.length > 0) {
          await fetch(`${USERS_URL}/${users[0].id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              lastCheckin: today,
            }),
          });
        }
      }
    } catch (error) {
      // ignore user patch failure
    }

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
    const normalizedUserId = String(userId).trim();
    const res = await fetch(CHECKIN_URL);

    if (!res.ok) {
      throw new Error("Cannot load history");
    }

    const checkins = await res.json();
    const userCheckins = checkins.filter((item) =>
      isSameUserId(item.userId, normalizedUserId)
    );
    const uniqueByDay = Array.from(
      new Map(userCheckins.map((item) => [item.timestamp, item])).values()
    );

    return uniqueByDay;
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
    const normalizedUserId = String(userId).trim();
    const history = await getCheckinHistory(normalizedUserId);

    if (history.length === 0) {
      return null;
    }

    const sorted = [...history].sort((a, b) =>
      b.timestamp.localeCompare(a.timestamp)
    );
    return sorted[0].timestamp;
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

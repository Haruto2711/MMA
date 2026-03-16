import { Platform } from "react-native";
const API_URL = "https://mma-db.onrender.com/notifications";

//const API_URL = "http://10.0.2.2:3000/notifications";
//const API_URL = "http://192.168.1.7:3000/notifications";
// Lấy danh sách thông báo theo userId

export const createNotification = async (data) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Create notification failed");
  }

  return await response.json();
};

export const getNotificationsByUser = async (userId) => {
  try {
    const res = await fetch(`${API_URL}?userId=${userId}`);
    if (!res.ok) throw new Error("Cannot fetch notifications");
    return await res.json();
  } catch (error) {
    console.error("Get notifications error:", error.message);
    throw error;
  }
};

// Đánh dấu đã đọc thông báo
export const markNotificationAsRead = async (notificationId) => {
  try {
    const res = await fetch(`${API_URL}/${notificationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: true }),
    });
    if (!res.ok) throw new Error("Cannot update notification");
    return await res.json();
  } catch (error) {
    console.error("Update notification error:", error.message);
    throw error;
  }
};
import { getLastCheckin } from "./checkInService";
import { getDaysBetween, getToday } from "../utils/dateUtils";
import { sendAlertEmail } from "./emailService";

/*
====================================
CHECK USER TIMEOUT
====================================
*/

export const checkUserTimeout = async (user) => {
  try {
    if (!user) {
      console.log("User not found");
      return;
    }

    console.log("Checking timeout for user:", user.id);

    const lastCheckin = await getLastCheckin(user.id);

    // nếu chưa checkin lần nào
    if (!lastCheckin) {
      console.log("User has never checked in");

      await sendAlertEmail(user.emergencyEmail, user.timeoutDays);

      return;
    }

    const today = getToday();

    const diffDays = getDaysBetween(lastCheckin, today);

    console.log("Last checkin:", lastCheckin);
    console.log("Today:", today);
    console.log("Days since last checkin:", diffDays);

    if (diffDays >= user.timeoutDays) {
      console.log("Timeout reached, sending email...");

      await sendAlertEmail(user.emergencyEmail, diffDays);
    }
  } catch (error) {
    console.log("Notification error:", error);
  }
};

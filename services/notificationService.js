import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.1.34:3000/notifications";

//const API_URL = "http://10.0.2.2:3000/notifications";
//const API_URL = "http://192.168.1.7:3000/notifications";
// Lấy danh sách thông báo theo userId

const getNotificationsStorageKey = (userId) =>
  `notifications_${String(userId)}`;

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
    const data = await res.json();
    
    // Lưu vào AsyncStorage
    const storageKey = getNotificationsStorageKey(userId);
    await AsyncStorage.setItem(storageKey, JSON.stringify(data));
    
    return data;
  } catch (error) {
    console.error("Get notifications error:", error.message);
    
    // Nếu lỗi, load từ AsyncStorage
    try {
      const storageKey = getNotificationsStorageKey(userId);
      const cachedData = await AsyncStorage.getItem(storageKey);
      if (cachedData) {
        console.log("Loading notifications from cache");
        return JSON.parse(cachedData);
      }
    } catch (cacheError) {
      console.error("Cache error:", cacheError.message);
    }
    
    throw error;
  }
};

// Đánh dấu đã đọc thông báo
export const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const res = await fetch(`${API_URL}/${notificationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: true }),
    });
    if (!res.ok) throw new Error("Cannot update notification");
    const updatedNotification = await res.json();
    
    // Cập nhật cache
    if (userId) {
      const storageKey = getNotificationsStorageKey(userId);
      const cachedData = await AsyncStorage.getItem(storageKey);
      if (cachedData) {
        const notifications = JSON.parse(cachedData);
        const updatedNotifications = notifications.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        );
        await AsyncStorage.setItem(storageKey, JSON.stringify(updatedNotifications));
      }
    }
    
    return updatedNotification;
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

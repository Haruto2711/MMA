import * as Notifications from "expo-notifications";

const API_URL = "http://192.168.1.34:3000";

/*
====================================
GET EXPO PUSH TOKEN
====================================
*/

export const getExpoPushToken = async () => {
  try {
    const token = await Notifications.getExpoPushTokenAsync();
    return token.data;
  } catch (error) {
    console.error("Get push token error:", error);
    return null;
  }
};

/*
====================================
SAVE PUSH TOKEN TO BACKEND
====================================
*/

export const savePushTokenToBackend = async (userId, expoPushToken) => {
  try {
    if (!userId || !expoPushToken) {
      console.log("Missing userId or expoPushToken");
      return;
    }

    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        expoPushToken,
      }),
    });

    if (!response.ok) {
      throw new Error("Save push token failed");
    }

    console.log("Push token saved for user:", userId);
    return await response.json();
  } catch (error) {
    console.error("Save push token error:", error);
  }
};

/*
====================================
SETUP PUSH TOKEN ON APP START
====================================
*/

export const setupPushToken = async (userId) => {
  try {
    const token = await getExpoPushToken();
    if (token && userId) {
      await savePushTokenToBackend(userId, token);
    }
  } catch (error) {
    console.error("Setup push token error:", error);
  }
};

export default {
  getExpoPushToken,
  savePushTokenToBackend,
  setupPushToken,
};

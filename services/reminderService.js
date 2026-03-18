import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { getToday } from "../utils/dateUtils";

/*
====================================
NOTIFICATION HANDLER
====================================
*/

// Cấu hình cách hiển thị notification
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const ensureNotificationChannel = async () => {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync("default", {
    name: "Default",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#4F8EF7",
  });
};

const CHECKIN_REMINDER_TYPES = ["checkin_reminder", "checkin_urgent", "checkin_hourly"];

const cancelCheckinScheduledNotifications = async () => {
  const scheduledNotifications =
    await Notifications.getAllScheduledNotificationsAsync();

  const checkinNotifications = scheduledNotifications.filter((item) => {
    const type = item?.content?.data?.type;
    return CHECKIN_REMINDER_TYPES.includes(type);
  });

  await Promise.all(
    checkinNotifications.map((item) =>
      Notifications.cancelScheduledNotificationAsync(item.identifier),
    ),
  );

  return checkinNotifications.length;
};

/*
====================================
HOURLY CHECK-IN REMINDER (7 AM – 11 PM)
====================================
*/

export const scheduleHourlyReminders = async () => {
  try {
    await ensureNotificationChannel();

    // Cancel existing hourly reminders to avoid duplicates
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const hourlyOnes = scheduled.filter(
      (item) => item?.content?.data?.type === "checkin_hourly",
    );
    await Promise.all(
      hourlyOnes.map((item) =>
        Notifications.cancelScheduledNotificationAsync(item.identifier),
      ),
    );

    // Schedule one daily notification per hour from 7 to 23
    for (let hour = 7; hour <= 23; hour++) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "⏰ Nhắc nhở Check-in",
          body: `Đã ${hour}:00 rồi! Bạn chưa check-in hôm nay. Hãy mở ứng dụng Are You Ok và check-in ngay.`,
          data: { type: "checkin_hourly", hour },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute: 0,
        },
      });
    }

    console.log("Hourly reminders scheduled from 7:00 to 23:00.");
  } catch (error) {
    console.error("Schedule hourly reminders error:", error);
  }
};

export const syncReminderByCheckin = async (lastCheckin) => {
  try {
    const todayDate = getToday().slice(0, 10);
    const hasCheckedInToday =
      !!lastCheckin && lastCheckin.slice(0, 10) === todayDate;

    if (hasCheckedInToday) {
      const cancelledCount = await cancelCheckinScheduledNotifications();
      console.log("Checked in today, cancelled reminders:", cancelledCount);
      return;
    }

    const scheduledNotifications =
      await Notifications.getAllScheduledNotificationsAsync();

    // Schedule hourly reminders from 7 AM if not already set
    const hasHourlyReminder = scheduledNotifications.some(
      (item) => item?.content?.data?.type === "checkin_hourly",
    );

    if (!hasHourlyReminder) {
      await scheduleHourlyReminders();
    }
  } catch (error) {
    console.error("Sync reminder by checkin error:", error);
  }
};

/*
====================================
REQUEST NOTIFICATION PERMISSION
====================================
*/

export const requestNotificationPermission = async () => {
  try {
    await ensureNotificationChannel();
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch (error) {
    console.error("Request permission error:", error);
    return false;
  }
};

/*
====================================
WELCOME NOTIFICATION AFTER REGISTER
====================================
*/

export const sendWelcomeNotification = async () => {
  try {
    await ensureNotificationChannel();

    const permission = await Notifications.getPermissionsAsync();
    let isGranted = permission.status === "granted";

    if (!isGranted) {
      isGranted = await requestNotificationPermission();
    }

    if (!isGranted) {
      return false;
    }

    const welcomeContent = {
      title: "Are You Ok",
      body: "Chào mừng bạn đến với Are You Ok! Hãy nhớ check-in hằng ngày để đảm bảo an toàn",
      data: {
        type: "welcome",
      },
    };

    try {
      // Show immediately when app is in foreground.
      await Notifications.presentNotificationAsync(welcomeContent);
    } catch (presentError) {
      // Fallback for environments where presentNotificationAsync is unavailable.
      await Notifications.scheduleNotificationAsync({
        content: welcomeContent,
        trigger: {
          type: "timeInterval",
          seconds: 1,
        },
      });
    }

    return true;
  } catch (error) {
    console.error("Welcome notification error:", error);
    return false;
  }
};

/*
====================================
CHECK IF NOT CHECKED IN TODAY
====================================
*/

export const checkNotCheckedInToday = async (lastCheckin) => {
  try {
    const todayDate = getToday().slice(0, 10);
    
    const hasCheckedIn = 
      lastCheckin && 
      lastCheckin.slice(0, 10) === todayDate;

    if (!hasCheckedIn) {
      // Gửi local notification ngay lập tức
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Check-in ngay!",
          body: "Bạn chưa check-in hôm nay. Hãy check-in ngay để không bị timeout.",
          data: {
            type: "checkin_urgent",
          },
        },
        trigger: {
          type: "timeInterval",
          seconds: 2, // Hiển thị sau 2 giây
        },
      });
    }
  } catch (error) {
    console.error("Check not checked in error:", error);
  }
};

/*
====================================
HANDLE NOTIFICATION RESPONSE
====================================
*/

export const setupNotificationResponseListener = (navigation) => {
  const subscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const notification = response.notification;
      const data = notification.request.content.data;

      if (data.type === "checkin_reminder" || data.type === "checkin_urgent") {
        // Điều hướng đến HomeScreen khi người dùng tap notification
        navigation.navigate("Home");
      }
    }
  );

  return subscription;
};

export default {
  syncReminderByCheckin,
  requestNotificationPermission,
  sendWelcomeNotification,
  checkNotCheckedInToday,
  setupNotificationResponseListener,
};

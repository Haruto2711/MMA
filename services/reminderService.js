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

const CHECKIN_REMINDER_TYPES = ["checkin_reminder", "checkin_urgent"];

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
DAILY CHECK-IN REMINDER
====================================
*/

export const scheduleDailyReminder = async () => {
  try {
    await ensureNotificationChannel();

    // Hủy reminder check-in cũ nếu có để tránh duplicate.
    await cancelCheckinScheduledNotifications();

    // Schedule reminder cố định lúc 00:05 mỗi ngày.
    const reminderId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "⏰ Nhắc nhở Check-in",
        body: "Hãy check-in ngay để cập nhật trạng thái của bạn!",
        data: {
          type: "checkin_reminder",
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 0,
        minute: 5,
      },
    });

    const scheduledNotifications =
      await Notifications.getAllScheduledNotificationsAsync();
    const scheduledReminder = scheduledNotifications.find(
      (item) => item.identifier === reminderId,
    );

    console.log("Daily reminder scheduled at 00:05", scheduledReminder?.trigger);
  } catch (error) {
    console.error("Schedule reminder error:", error);
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
    const hasDailyReminder = scheduledNotifications.some(
      (item) => item?.content?.data?.type === "checkin_reminder",
    );

    if (!hasDailyReminder) {
      await scheduleDailyReminder();
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
  scheduleDailyReminder,
  syncReminderByCheckin,
  requestNotificationPermission,
  sendWelcomeNotification,
  checkNotCheckedInToday,
  setupNotificationResponseListener,
};

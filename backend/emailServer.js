const express = require("express");
const nodemailer = require("nodemailer");
const cron = require("node-cron");

const app = express();

app.use(express.json());

const EMERGENCY_ALERT_DAYS = 3;
const NOTE_REMINDER_DAYS = 5;

// Track last alert date per user to avoid re-sending multiple times per day
// Key: userId, Value: "YYYY-MM-DD" date string of last sent alert
const lastAlertSentDate = new Map();

/*
====================================
DATABASE API
====================================
*/

//const API_URL = "http://10.33.56.150:3000";
const API_URL = "http://192.168.1.34:3000";

/*
====================================
EMAIL TRANSPORTER
====================================
*/

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ngochuyn029@gmail.com",
    pass: "rnvk bdbg rgqs bvae",
  },
});

/*
====================================
SEND PUSH NOTIFICATION
====================================
*/

async function sendPushNotification(expoPushToken, title, message) {
  try {
    if (!expoPushToken) {
      console.log("No push token available");
      return;
    }

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: expoPushToken,
        sound: "default",
        title: title || "Cảnh báo khẩn cấp",
        body: message || "Người dùng chưa check-in",
        data: { type: "checkin_alert" },
      }),
    });

    const result = await response.json();
    console.log("Push notification sent:", result);
    return result;
  } catch (error) {
    console.error("Send push notification error:", error);
  }
}

/*
====================================
SEND EMAIL FUNCTION (Updated)
====================================
*/

async function sendEmailAndNotification(toEmail, expoPushToken, subject, message) {
  try {
    // Send email
    const mailOptions = {
      from: "ngochuyn029@gmail.com",
      to: toEmail,
      subject,
      text: message,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent to:", toEmail);

    // Send push notification if token exists
    if (expoPushToken) {
      await sendPushNotification(expoPushToken, subject, message);
    }
  } catch (error) {
    console.error("Send email/notification error:", error);
  }
}

/*
====================================
API SEND ALERT
====================================
*/

app.post("/send-alert", async (req, res) => {
  try {
    const { toEmail, subject, message, expoPushToken } = req.body;

    if (!toEmail) {
      return res.status(400).json({
        success: false,
        message: "Email là bắt buộc",
      });
    }

    await sendEmailAndNotification(
      toEmail,
      expoPushToken,
      subject || "Cảnh báo khẩn cấp",
      message || "Không phát hiện check-in."
    );

    res.json({
      success: true,
      message: "Gửi cảnh báo thành công",
    });
  } catch (error) {
    console.log("Send alert error:", error);

    res.status(500).json({
      success: false,
      message: "Gửi cảnh báo thất bại",
    });
  }
});

/*
====================================
SEND USER NOTES EMAIL
====================================
*/

async function sendUserNotesEmail(user, diffDays) {
  try {
    const notesRes = await fetch(`${API_URL}/notes?userId=${user.id}`);
    if (!notesRes.ok) return;

    const notes = await notesRes.json();

    if (!notes || notes.length === 0) {
      console.log("No notes found for user:", user.email);
      return;
    }

    const sortedNotes = [...notes].sort((a, b) => {
      const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return timeB - timeA;
    });

    const notesText = sortedNotes
      .map((note, index) => {
        const updatedAt = note.updatedAt || note.createdAt;
        const formattedDate = updatedAt
          ? new Date(updatedAt).toLocaleString("vi-VN")
          : "Không rõ";
        const noteContent = String(note.content || "").trim() || "(Trống)";
        const noteTitle = String(note.title || "").trim() || "(Không có tiêu đề)";

        return `--- Ghi chú ${index + 1} ---\nNgày: ${formattedDate}\nTiêu đề: ${noteTitle}\nNội dung: ${noteContent}`;
      })
      .join("\n\n");

    const subject = `Ghi chú của ${user.email} - Chưa check-in ${diffDays} ngày`;
    const message =
      `Người dùng ${user.email} đã không check-in trong ${diffDays} ngày.\n\n` +
      `Dưới đây là các ghi chú của họ:\n\n${notesText}`;

    const mailOptions = {
      from: "ngochuyn029@gmail.com",
      to: user.emergencyEmail,
      subject,
      text: message,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Notes email sent to ${user.emergencyEmail} for user ${user.email}`);
  } catch (error) {
    console.error("sendUserNotesEmail error:", error);
  }
}

/*
====================================
CHECK USERS TIMEOUT
====================================
*/

async function checkUsers() {
  try {
    const usersRes = await fetch(`${API_URL}/users`);
    const checkinsRes = await fetch(`${API_URL}/checkins`);

    const users = await usersRes.json();
    const checkins = await checkinsRes.json();

    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    for (const user of users) {
      // Only send one alert per user per day
      if (lastAlertSentDate.get(user.id) === todayStr) {
        continue;
      }

      const userCheckins = checkins
        .filter((c) => c.userId == user.id)
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

      if (userCheckins.length === 0) {
        console.log("User never checked in:", user.email);
        await sendEmailAndNotification(
          user.emergencyEmail,
          user.expoPushToken,
          "Cảnh báo khẩn cấp - Chưa check-in",
          "Người dùng chưa từng check-in. Vui lòng theo dõi ngay lập tức."
        );
        lastAlertSentDate.set(user.id, todayStr);
        continue;
      }

      const lastCheckin = new Date(userCheckins[0].timestamp);

      const diffDays = Math.floor(
        (today - lastCheckin) / (1000 * 60 * 60 * 24),
      );

      console.log("User:", user.email, "Days:", diffDays);

      if (diffDays >= NOTE_REMINDER_DAYS) {
        console.log("User overdue 5 days, sending notes:", user.email);
        await sendUserNotesEmail(user, diffDays);
        lastAlertSentDate.set(user.id, todayStr);
      } else if (diffDays >= EMERGENCY_ALERT_DAYS) {
        console.log("User overdue:", user.email);
        await sendEmailAndNotification(
          user.emergencyEmail,
          user.expoPushToken,
          "Cảnh báo khẩn cấp - Chưa check-in",
          `Người dùng đã không check-in trong ${diffDays} ngày. Vui lòng theo dõi ngay lập tức.`
        );
        lastAlertSentDate.set(user.id, todayStr);
      }
    }
  } catch (error) {
    console.log("Check users error:", error);
  }
}

/*
====================================
CRON JOB
====================================
*/


// Timeout check every 5 minutes for near real-time emergency alerts.
cron.schedule("*/5 * * * *", () => {
  console.log("Running timeout check...");
  checkUsers();
});

// Track last hourly reminder date per user to avoid sending more than once per day
const lastReminderSentDate = new Map();

// Hourly check-in reminder: every hour from 7 AM to 11 PM
// Sends email + push notification to users who haven't checked in today (max once per user per day)
cron.schedule("0 7-23 * * *", async () => {
  try {
    const usersRes = await fetch(`${API_URL}/users`);
    const checkinsRes = await fetch(`${API_URL}/checkins`);
    const users = await usersRes.json();
    const checkins = await checkinsRes.json();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().slice(0, 10);

    const hour = new Date().getHours();

    for (const user of users) {
      // Only send one reminder email per user per day
      if (lastReminderSentDate.get(user.id) === todayStr) {
        continue;
      }

      const userCheckins = checkins
        .filter((c) => c.userId == user.id)
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

      let checkedInToday = false;
      if (userCheckins.length > 0) {
        const lastCheckin = new Date(userCheckins[0].timestamp);
        lastCheckin.setHours(0, 0, 0, 0);
        checkedInToday = lastCheckin.getTime() === today.getTime();
      }

      if (user.email && !checkedInToday) {
        await sendEmailAndNotification(
          user.email,
          user.expoPushToken,
          "Nhắc nhở check-in",
          `Bạn chưa check-in hôm nay (${hour}:00). Hãy mở ứng dụng Are You Ok và check-in để đảm bảo an toàn.`
        );
        lastReminderSentDate.set(user.id, todayStr);
        console.log(`[${hour}:00] Hourly reminder sent to:`, user.email);
      }
    }
    console.log(`Hourly check-in reminder done at ${hour}:00.`);
  } catch (error) {
    console.log("Hourly reminder error:", error);
  }
});

/*
====================================
SERVER START
====================================
*/

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log("Email server running on port", PORT);
});

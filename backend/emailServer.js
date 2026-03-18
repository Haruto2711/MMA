const express = require("express");
const nodemailer = require("nodemailer");
const cron = require("node-cron");

const app = express();

app.use(express.json());

const EMERGENCY_ALERT_DAYS = 3;

/*
====================================
DATABASE API
====================================
*/

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

    for (const user of users) {
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
        continue;
      }

      const lastCheckin = new Date(userCheckins[0].timestamp);

      const diffDays = Math.floor(
        (today - lastCheckin) / (1000 * 60 * 60 * 24),
      );

      console.log("User:", user.email, "Days:", diffDays);

      if (diffDays >= EMERGENCY_ALERT_DAYS) {
        console.log("User overdue:", user.email);
        await sendEmailAndNotification(
          user.emergencyEmail,
          user.expoPushToken,
          "Cảnh báo khẩn cấp - Chưa check-in",
          `Người dùng đã không check-in trong ${diffDays} ngày. Vui lòng theo dõi ngay lập tức.`
        );
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

// Check-in reminder email (daily at 00:05)
cron.schedule("5 0 * * *", async () => {
  try {
    const usersRes = await fetch(`${API_URL}/users`);
    const checkinsRes = await fetch(`${API_URL}/checkins`);
    const users = await usersRes.json();
    const checkins = await checkinsRes.json();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const user of users) {
      // Lấy checkin gần nhất của user
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
          "Bạn chưa check-in hôm nay. Hãy mở ứng dụng Are You Ok và check-in để đảm bảo an toàn."
        );
      }
    }
    console.log("Daily check-in reminder emails sent at 00:05.");
  } catch (error) {
    console.log("Daily reminder error:", error);
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

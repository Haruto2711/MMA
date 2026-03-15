const express = require("express");
const nodemailer = require("nodemailer");
const cron = require("node-cron");

const app = express();

app.use(express.json());

/*
====================================
DATABASE API
====================================
*/

const API_URL = "https://mma-db.onrender.com";

/*
====================================
EMAIL TRANSPORTER
====================================
*/

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ngochuyn029@gmail.com",
    pass: "rnvk bdbg rgqs bvae"
  }
});

/*
====================================
SEND EMAIL FUNCTION
====================================
*/

async function sendEmail(toEmail, days) {

  const mailOptions = {
    from: "ngochuyn029@gmail.com",
    to: toEmail,
    subject: "Emergency Alert - No Check-in",
    text: `The user has not checked in for ${days} days`
  };

  await transporter.sendMail(mailOptions);

  console.log("Email sent to:", toEmail);
}

/*
====================================
API SEND ALERT
====================================
*/

app.post("/send-alert", async (req, res) => {

  try {

    const { toEmail, days } = req.body;

    if (!toEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    await sendEmail(toEmail, days);

    res.json({
      success: true,
      message: "Email sent successfully"
    });

  } catch (error) {

    console.log("Send email error:", error);

    res.status(500).json({
      success: false,
      message: "Email failed"
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
        .filter(c => c.userId == user.id)
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

      if (userCheckins.length === 0) {
        console.log("User never checked in:", user.email);
        continue;
      }

      const lastCheckin = new Date(userCheckins[0].timestamp);

      const diffDays = Math.floor(
        (today - lastCheckin) / (1000 * 60 * 60 * 24)
      );

      console.log("User:", user.email, "Days:", diffDays);

      if (diffDays >= user.timeoutDays) {

        console.log("User overdue:", user.email);

        await sendEmail(
          user.emergencyEmail,
          diffDays
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

cron.schedule("*/1 * * * *", () => {

  console.log("Running timeout check...");

  checkUsers();

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
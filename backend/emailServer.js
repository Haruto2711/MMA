const express = require("express");
const nodemailer = require("nodemailer");
const cron = require("node-cron");
const fs = require("fs");

const app = express();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ngochuyn029@gmail.com",
    pass: "rnvk bdbg rgqs bvae"
  }
});

/*
========================
SEND EMAIL FUNCTION
========================
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
========================
CHECK ALL USERS
========================
*/

function checkUsers() {

  const db = JSON.parse(
    fs.readFileSync("../db.json")
  );

  const users = db.users;
  const checkins = db.checkins;

  const today = new Date();

  users.forEach(async (user) => {

    const userCheckins = checkins
      .filter(c => c.userId == user.id)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

    if (userCheckins.length === 0) {
      return;
    }

    const lastCheckin = new Date(userCheckins[0].timestamp);

    const diffDays = Math.floor(
      (today - lastCheckin) / (1000 * 60 * 60 * 24)
    );

    if (diffDays >= user.timeoutDays) {

      console.log("User overdue:", user.email);

      await sendEmail(
        user.emergencyEmail,
        diffDays
      );
    }

  });
}

/*
========================
CRON JOB
========================
*/

cron.schedule("*/1 * * * *", () => {
  console.log("Running check...");
  checkUsers();
});

app.listen(4000, () => {
  console.log("Server running on port 4000");
});

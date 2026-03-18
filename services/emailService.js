/*
====================================
EMAIL SERVER CONFIG
====================================
*/

const EMAIL_SERVER_URL = "http://192.168.1.34:4000/send-alert";

/*
====================================
SEND ALERT EMAIL TO SERVER
====================================
*/

export const sendAlertEmail = async (toEmail, days, expoPushToken = null) => {
  try {
    if (!toEmail) {
      console.log("No emergency email provided");
      return;
    }

    const response = await fetch(EMAIL_SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        toEmail,
        expoPushToken,
        subject: "Emergency Alert - No Check-in",
        message: `The user has not checked in for ${days} days. Please follow up immediately.`,
      }),
    });

    if (!response.ok) {
      throw new Error("Email request failed");
    }

    const data = await response.json();

    console.log("Email sent:", data);

    return data;
  } catch (error) {
    console.log("Send email error:", error);
  }
};

/*
====================================
SEND CHECK-IN REMINDER EMAIL
====================================
*/

export const sendCheckinReminderEmail = async (toEmail) => {
  try {
    if (!toEmail) {
      console.log("No email provided for check-in reminder");
      return;
    }

    const response = await fetch(EMAIL_SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        toEmail,
        subject: "Nhắc nhở check-in",
        message:
          "Bạn chưa check-in hôm nay. Hãy mở ứng dụng Are You Ok và check-in để đảm bảo an toàn.",
      }),
    });

    if (!response.ok) {
      throw new Error("Check-in reminder email request failed");
    }

    const data = await response.json();
    console.log("Check-in reminder email sent:", data);
    return data;
  } catch (error) {
    console.log("Send check-in reminder email error:", error);
  }
};

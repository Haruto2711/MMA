/*
====================================
EMAIL SERVER CONFIG
====================================
*/

const EMAIL_SERVER_URL = "http://192.168.1.34:3000/send-alert";

/*
====================================
SEND ALERT EMAIL TO SERVER
====================================
*/

export const sendAlertEmail = async (toEmail, days) => {
  try {
    if (!toEmail) {
      console.log("No emergency email provided");
      return;
    }

    console.log("Sending alert email...");
    console.log("To:", toEmail);
    console.log("Days:", days);

    const response = await fetch(EMAIL_SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        toEmail,
        days,
      }),
    });

    if (!response.ok) {
      throw new Error("Email request failed");
    }

    const data = await response.json();

    console.log("Email sent successfully:", data);

    return data;
  } catch (error) {
    console.log("Send email error:", error, error?.response, error?.message);
  }
};

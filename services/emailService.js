/*
====================================
EMAIL SERVER CONFIG
====================================
*/

const EMAIL_SERVER_URL =
"https://mma-email.onrender.com/send-alert";

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

    const response = await fetch(EMAIL_SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        toEmail,
        days
      })
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
import { getLastCheckin } from "./checkInService";
import { getDaysBetween, getToday } from "../utils/dateUtils";
import { sendAlertEmail } from "./emailService";

/*
====================================
CHECK USER TIMEOUT
====================================
*/

export const checkUserTimeout = async (user) => {

  try {

    if (!user) {
      console.log("User not found");
      return;
    }

    console.log("Checking timeout for user:", user.id);

    const lastCheckin = await getLastCheckin(user.id);

    // nếu chưa checkin lần nào
    if (!lastCheckin) {

      console.log("User has never checked in");

      await sendAlertEmail(
        user.emergencyEmail,
        user.timeoutDays
      );

      return;
    }

    const today = getToday();

    const diffDays = getDaysBetween(lastCheckin, today);

    console.log("Last checkin:", lastCheckin);
    console.log("Today:", today);
    console.log("Days since last checkin:", diffDays);

    if (diffDays >= user.timeoutDays) {

      console.log("Timeout reached, sending email...");

      await sendAlertEmail(
        user.emergencyEmail,
        diffDays
      );

    }

  } catch (error) {

    console.log("Notification error:", error);

  }

};

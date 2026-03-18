const BASE_URL = "http://192.168.1.34:3000/users";
const NOTIFICATIONS_URL = "http://192.168.1.34:3000/notifications";
const EMAIL_SERVER_URL = "http://192.168.1.34:4000/send-alert";

const isValidEmail = (value) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return emailRegex.test(String(value || "").trim().toLowerCase());
};
/*
========================
LOGIN
========================
*/
export const login = async (email, password) => {
  try {
    const response = await fetch(`${BASE_URL}?email=${email}`);
    const users = await response.json();

    if (!users || users.length === 0) {
      throw new Error("User not found");
    }

    const user = users[0];

    if (user.password !== password) {
      throw new Error("Invalid password");
    }

    return user;
  } catch (error) {
    console.error("Login error:", error.message);
    throw error;
  }
};

/*
========================
REGISTER
========================
*/
export const register = async (userData) => {
  try {
    const email = String(userData?.email || "").trim().toLowerCase();
    const emergencyEmail = String(userData?.emergencyEmail || "").trim().toLowerCase();
    const timeoutDays = Number(userData?.timeoutDays);

    if (!email || !emergencyEmail || !userData?.password) {
      throw new Error("Vui lòng nhập đầy đủ thông tin đăng ký");
    }

    if (!isValidEmail(email)) {
      throw new Error("Email đăng nhập không đúng định dạng");
    }

    if (!isValidEmail(emergencyEmail)) {
      throw new Error("Email người thân không đúng định dạng");
    }

    if (email === emergencyEmail) {
      throw new Error("Email người thân không được trùng email đăng nhập");
    }

    if (!Number.isInteger(timeoutDays) || timeoutDays < 1) {
      throw new Error("Số ngày cảnh báo phải là số nguyên lớn hơn 0");
    }

    // check email tồn tại
    const check = await fetch(`${BASE_URL}?email=${email}`);
    const existingUsers = await check.json();

    if (existingUsers.length > 0) {
      throw new Error("Email already exists");
    }

    const newUser = {
      ...userData,
      email,
      emergencyEmail,
      timeoutDays,
      lastCheckin: null,
    };

    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newUser),
    });

    if (!response.ok) {
      throw new Error("Register failed");
    }

    const createdUser = await response.json();

    // Create an in-app welcome notification for new users.
    try {
      await fetch(NOTIFICATIONS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: createdUser.id,
          type: "info",
          message: "Chào mừng bạn đến với Are You Ok! Hãy nhớ check-in hàng ngày để đảm bảo an toàn",
          sentAt: new Date().toISOString().slice(0, 10),
          read: false,
        }),
      });
    } catch (notificationError) {
      console.error("Create welcome notification error:", notificationError.message);
    }

    // Send welcome email automatically after register.
    try {
      await fetch(EMAIL_SERVER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toEmail: createdUser.email,
          subject: "Chao mung den voi Are You Ok",
          message:
            "Chao mung ban den voi Are You Ok! Hay nho check-in hang ngay de dam bao an toan.",
        }),
      });
    } catch (emailError) {
      console.error("Send welcome email error:", emailError.message);
    }

    return createdUser;
  } catch (error) {
    console.error("Register error:", error.message);
    throw error;
  }
};

/*
========================
GET USER BY ID
========================
*/
export const getUserById = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`);

    if (!response.ok) {
      throw new Error("User not found");
    }

    return await response.json();
  } catch (error) {
    console.error("Get user error:", error.message);
    throw error;
  }
};

/*
========================
UPDATE USER
========================
*/
export const updateUser = async (id, data) => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Update failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Update user error:", error.message);
    throw error;
  }
};

/*
========================
RESET PASSWORD
========================
*/
export const resetPassword = async (email, newPassword) => {
  try {
    const response = await fetch(`${BASE_URL}?email=${email}`);
    const users = await response.json();

    if (users.length === 0) {
      throw new Error("Email not found");
    }

    const user = users[0];

    const update = await fetch(`${BASE_URL}/${user.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password: newPassword,
      }),
    });

    return await update.json();
  } catch (error) {
    console.error("Reset password error:", error.message);
    throw error;
  }
};

/*
========================
LOGOUT
========================
*/
export const logout = () => {
  return true;
};

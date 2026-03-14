const BASE_URL = "http://192.168.1.11:3001/users";
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
    // check email tồn tại
    const check = await fetch(`${BASE_URL}?email=${userData.email}`);
    const existingUsers = await check.json();

    if (existingUsers.length > 0) {
      throw new Error("Email already exists");
    }

    const newUser = {
      ...userData,
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

    return await response.json();
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

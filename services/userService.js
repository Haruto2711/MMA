const API_URL = "http://localhost:3000/users";

/*
========================
GET ALL USERS
========================
*/
export const getUsers = async () => {
  try {

    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Cannot fetch users");
    }

    return await response.json();

  } catch (error) {
    console.error("Get users error:", error.message);
    throw error;
  }
};


/*
========================
GET USER BY ID
========================
*/
export const getUserById = async (userId) => {
  try {

    const response = await fetch(`${API_URL}/${userId}`);

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
UPDATE USER PROFILE
========================
*/
export const updateUser = async (userId, data) => {
  try {

    const response = await fetch(`${API_URL}/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
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
DELETE USER
========================
*/
export const deleteUser = async (userId) => {
  try {

    const response = await fetch(`${API_URL}/${userId}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      throw new Error("Delete failed");
    }

    return true;

  } catch (error) {
    console.error("Delete user error:", error.message);
    throw error;
  }
};
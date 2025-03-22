const User = require("./model/user"); // Import the user schema

/**
 * Check if a user exists in the database.
 * If they exist, fetch their data.
 * If not, create a new user and return their data.
 * @param {string} user_id - Firebase UID
 * @param {string} name - User's display name
 * @param {string} role - Role 
 * @returns {Promise<object>} - The user data from MongoDB
 */
const checkAndFetchUser = async (user_id, name, role) => {
  try {
    let user = await User.findOne({ user_id });

    if (!user) {
      // User does not exist → Create a new one
      user = await User.create({ user_id, name, role});
    }

    return user; // Return user data
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to fetch or create user.");
  }
};

module.exports = { checkAndFetchUser };

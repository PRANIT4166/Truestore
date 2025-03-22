const User = require("./model/user"); // Ensure correct import

/**
 * Check if user exists; if not, create a new user.
 * @param {string} ser_ - Firebase ser_
 * @param {string} name - User's name
 * @param {string} role -   User's role, email
 * @returns {Promise<Object>} - User data
 */
const checkAndFetchUser = async (user_id, name, role, email) => {
  try {
    let user = await User.findOne({ user_id });

    if (!user) {
      console.log("User not found, creating new user..."); // Debug log
      user = new User({ user_id, name, role, email });

      await user.save();
      console.log("User created:", user);
    } else {
      console.log("User exists:", user);
    }

    return user;
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to fetch or create user.");
  }
};

module.exports = { checkAndFetchUser };

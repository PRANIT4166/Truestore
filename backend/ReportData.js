const report = require("./model/report"); // Ensure correct import

/**
 * Check if user exists; if not, create a new user.
 * @param {string} ser_ - Firebase ser_
 * @param {string} name - User's name
 * @param {string} role -   User's role, email
 * @returns {Promise<Object>} - User data
 */
const addDetails = async (report_id,vehicle_id,Location, description) => {
  try {
        let repo = await report.findOne({ report_id });

        if (!repo) {
            console.error("❌ Report not found:", report_id);
            throw new Error("Report not found.");
          }

        repo.metadata.vehicle = vehicle_id;
        repo.metadata.loc = Location;
        repo.metadata.desc = description;

        await repo.save();
    
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to fetch or create user.");
  }
};

module.exports = { addDetails };

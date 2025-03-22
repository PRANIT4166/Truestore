const mongoose = require("mongoose");

const ValidationSchema = new mongoose.Schema({
  validation_id: { type: String, required: true, unique: true },
  report_id: { type: mongoose.Schema.Types.String, ref: "report" },
  validator_id: { type: mongoose.Schema.Types.String, ref: "user" },
  vote: { type: Boolean, required: true },
  voted_at: { type: Date, default: Date.now }
});

// changes to test
module.exports = mongoose.model("validation", ValidationSchema);

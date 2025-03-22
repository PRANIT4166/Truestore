const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  report_id: { type: String, required: true, unique: true },
  file_hash: { type: String, required: true },
  metadata: {
    loc: { type: String },
    time: { type: Date },
    vehicle: { type: String }
  },
  status: { type: String, enum: ["pending", "verified", "rejected"], default: "pending" },
  submitted_by: { type: mongoose.Schema.Types.String, ref: "User" },
  submitted_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("report", ReportSchema);


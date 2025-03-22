const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, required: true, enum: ["user", "validator"] },
  tokens: { type: Number, default: 0 },
  registered_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("user", UserSchema);

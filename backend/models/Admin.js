const mongoose = require("mongoose");

// Admin is a separate collection — only created via seedAdmin.js script
const adminSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Admin" },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true }, // bcrypt hash — never plain text
    // Legacy field — kept for backward compat detection, not used for auth
    password: { type: String, select: false },
  },
  { timestamps: true }
);

const Admin = mongoose.model("Admin", adminSchema, "Admin");

module.exports = Admin;

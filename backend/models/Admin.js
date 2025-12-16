const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const Admin = mongoose.model("Admin", adminSchema, "Admin");

module.exports = Admin;

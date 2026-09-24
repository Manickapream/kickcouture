require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

async function fixPassword() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash("mani", salt);

    await Admin.updateOne(
      { email: "manipirama@gmail.com" },
      { $set: { passwordHash: hash } }
    );
    console.log("Successfully set password for manipirama@gmail.com to 'mani'!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
fixPassword();

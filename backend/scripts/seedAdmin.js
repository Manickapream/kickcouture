/**
 * KickCouture — Admin Seed Script
 * ================================
 * Run this once to create a secure admin account:
 *
 *   cd kickcouture-main/backend
 *   node scripts/seedAdmin.js
 *
 * Set credentials in .env before running:
 *   ADMIN_SEED_EMAIL=admin@kickcouture.com
 *   ADMIN_SEED_PASSWORD=YourSecurePassword123!
 *
 * After running, remove ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD from .env.
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

async function seedAdmin() {
  const email = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!email || !password) {
    console.error(
      "❌ Missing ADMIN_SEED_EMAIL or ADMIN_SEED_PASSWORD in .env\n" +
      "   Add them to backend/.env and re-run this script.\n" +
      "   Example:\n" +
      "     ADMIN_SEED_EMAIL=admin@kickcouture.com\n" +
      "     ADMIN_SEED_PASSWORD=YourSecurePassword123!"
    );
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("❌ ADMIN_SEED_PASSWORD must be at least 8 characters.");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const existingAdmin = await Admin.findOne({ email });

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    if (existingAdmin) {
      // Update existing admin (migrate from plain-text or update password)
      existingAdmin.passwordHash = passwordHash;
      existingAdmin.name = existingAdmin.name || "Admin";
      existingAdmin.email = email;
      await existingAdmin.save();
      console.log(`✅ Admin account updated for: ${email}`);
    } else {
      // Create new admin
      const admin = new Admin({
        name: "Admin",
        email,
        passwordHash,
      });
      await admin.save();
      console.log(`✅ Admin account created for: ${email}`);
    }

    console.log("\n🔒 Admin credentials are secured with bcrypt.");
    console.log("⚠️  Remember to remove ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD from .env!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
}

seedAdmin();

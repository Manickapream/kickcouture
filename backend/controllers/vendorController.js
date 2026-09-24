const Vendor = require("../models/Vendor");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// ─── POST /api/vendor/register ───────────────────────────────────────────────
exports.registerVendor = async (req, res) => {
  const { ownerName, businessName, email, phone, address, businessDescription, password, confirmPassword } = req.body;

  // Validate required fields
  if (!ownerName || !businessName || !email || !phone || !address || !password || !confirmPassword) {
    return res.status(400).json({ message: "All required fields must be filled." });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match." });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email address." });
  }

  try {
    // Check for existing vendor with same email
    const existing = await Vendor.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      if (["pending", "approved"].includes(existing.status)) {
        return res.status(400).json({
          message: "A vendor application with this email already exists.",
          status: existing.status,
        });
      }
      // Rejected vendors can re-apply
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const vendor = new Vendor({
      ownerName: ownerName.trim(),
      businessName: businessName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      address: address.trim(),
      businessDescription: businessDescription?.trim() || "",
      passwordHash,
      status: "pending",
    });

    await vendor.save();

    res.status(201).json({
      message: "Vendor application submitted successfully. Await admin approval.",
      vendorId: vendor._id,
      status: vendor.status,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email already registered." });
    }
    res.status(500).json({ message: "Registration failed.", error: err.message });
  }
};

// ─── POST /api/vendor/login ───────────────────────────────────────────────────
exports.loginVendor = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const vendor = await Vendor.findOne({ email: email.toLowerCase().trim() });

    if (!vendor) {
      return res.status(404).json({ message: "No vendor account found with this email." });
    }

    // Status-specific error messages
    if (vendor.status === "pending") {
      return res.status(403).json({
        message: "Your application is pending admin approval. Please check back later.",
        status: "pending",
      });
    }

    if (vendor.status === "rejected") {
      return res.status(403).json({
        message: "Your vendor application was rejected. Contact support for more information.",
        status: "rejected",
        reason: vendor.rejectionReason || "",
      });
    }

    if (vendor.status === "suspended") {
      return res.status(403).json({
        message: "Your vendor account has been suspended. Contact support.",
        status: "suspended",
      });
    }

    // Only approved vendors get past this point
    const isMatch = await bcrypt.compare(password, vendor.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign(
      {
        id: vendor._id,
        vendorId: vendor._id,
        role: "vendor",
        businessName: vendor.businessName,
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      vendor: {
        id: vendor._id,
        ownerName: vendor.ownerName,
        businessName: vendor.businessName,
        email: vendor.email,
        status: vendor.status,
        role: "vendor",
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed.", error: err.message });
  }
};

// ─── GET /api/vendor/profile  (verifyToken + requireVendor) ──────────────────
exports.getVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.user.vendorId).select("-passwordHash -password");
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found." });
    }
    res.status(200).json({ vendor });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile.", error: err.message });
  }
};

// ─── PUT /api/vendor/profile ─────────────────────────────────────────────────
exports.updateVendorProfile = async (req, res) => {
  try {
    const { ownerName, phone, address, businessDescription } = req.body;
    const vendor = await Vendor.findById(req.user.vendorId);

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found." });
    }

    // Update allowed fields
    if (ownerName) vendor.ownerName = ownerName.trim();
    if (phone) vendor.phone = phone.trim();
    if (address) vendor.address = address.trim();
    if (businessDescription !== undefined) vendor.businessDescription = businessDescription.trim();

    await vendor.save();

    res.status(200).json({
      message: "Profile updated successfully.",
      vendor: {
        id: vendor._id,
        ownerName: vendor.ownerName,
        businessName: vendor.businessName,
        email: vendor.email,
        phone: vendor.phone,
        address: vendor.address,
        businessDescription: vendor.businessDescription,
        status: vendor.status,
        createdAt: vendor.createdAt,
        approvedAt: vendor.approvedAt,
        rejectionReason: vendor.rejectionReason
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile.", error: err.message });
  }
};

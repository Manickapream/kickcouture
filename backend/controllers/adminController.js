const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");

const SECRET = "adminSecretKey";

exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    console.log(admin);

    if (!admin) {
      return res.status(400).json({ message: "Admin not found" });
    }

    if (admin.password !== password) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: admin._id }, SECRET, { expiresIn: "1h" });

    res.json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name || "Admin"
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// POST /api/user/signup
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({ name, email, password: password });
    await newUser.save();

    res.status(201).json({ message: "Signup successful" });
  } catch (err) {
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
});

// POST /api/user/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (password !== user.password) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, "yourSecretKey", { expiresIn: "1h" });

    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

// delete user - for admin /api/user/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user", error: err.message });
  }
});

// GET /api/user/userCount
router.get("/userCount", async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.status(200).json({ userCount: count });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user count", error: err.message });
  }
});

// GET all users - for admin /api/user/
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users", error: err.message });
  }
});

module.exports = router;
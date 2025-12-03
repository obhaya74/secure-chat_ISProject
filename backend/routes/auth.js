const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { logEvent } = require("../utils/logger");

const User = require("../models/User");

// =========================
// SIGNUP
// =========================
router.post("/signup", async (req, res) => {
  try {
    console.log("Signup received:", req.body);   // <---- ADD THIS

    const { username, email, password, pubSigningKeyJwk, pubEcdhKeyJwk } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      pubSigningKeyJwk: pubSigningKeyJwk || null,
      pubEcdhKeyJwk: pubEcdhKeyJwk || null
    });

    await newUser.save();
    logEvent("AUTH_SIGNUP", {
    userId: newUser._id,
    username: newUser.username
});

    res.json({ message: "User created successfully" });
    

  } catch (err) {
    console.error("Signup error:", err); // <---- ADD THIS
    res.status(500).json({ error: "Signup failed", details: err.message });
  }
});


// =========================
// LOGIN
// =========================
router.post("/login", async (req, res) => {
  try {
    console.log("\n=== LOGIN REQUEST ===");
    console.log("Received body:", req.body);

    const { username, password } = req.body;

    // Try finding user by username OR email
    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    });

    console.log("MongoDB returned user:", user);

    if (!user) {
      console.log("❌ ERROR: User not found");
      return res.status(400).json({ error: "User not found" });
    }

    // Compare password
    const match = await bcrypt.compare(password, user.password);
    console.log("Password match result:", match);

    if (!match) {
      console.log("❌ ERROR: Incorrect password");
      return res.status(400).json({ error: "Incorrect password" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log("✔ LOGIN SUCCESSFUL for:", user.username);
logEvent("AUTH_LOGIN_SUCCESS", {
    userId: user._id,
    username: user.username,
    ip: req.ip
});

    res.json({
  message: "Login successful",
  token,
  user: {
    _id: user._id,
    username: user.username,
    email: user.email
  },
  pubSigningKeyJwk: user.pubSigningKeyJwk,
  pubEcdhKeyJwk: user.pubEcdhKeyJwk
});


  } catch (err) {
    logEvent("AUTH_LOGIN_FAILURE", {
    username: req.body.username,
    ip: req.ip
});

    console.error("🔥 SERVER LOGIN ERROR:", err);
    res.status(500).json({ error: "Login failed", details: err.message });
  }
});


module.exports = router;

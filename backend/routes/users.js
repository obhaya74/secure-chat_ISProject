const express = require("express");
const router = express.Router();
const User = require("../models/User");

// GET ALL USERS
// backend/routes/userRoutes.js
router.get("/", async (req, res) => {
  try {
    const users = await User.find({}, "_id username");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;

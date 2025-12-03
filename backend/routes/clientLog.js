const express = require("express");
const router = express.Router();
const { logEvent } = require("../utils/logger");
const authVerify = require("../middleware/authVerify");

router.post("/", authVerify, (req, res) => {
  const { event, details } = req.body;
  logEvent(`CLIENT_${event}`, details);
  res.json({ status: "logged" });
});

module.exports = router;

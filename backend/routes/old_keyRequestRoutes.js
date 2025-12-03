const express = require("express");
const router = express.Router();
const KeyRequest = require("../models/KeyRequest");

// SEND KEY REQUEST
router.post("/send", async (req, res) => {
  try {
    const { fromId, toId } = req.body;

    const exists = await KeyRequest.findOne({
      from: fromId,
      to: toId,
      status: "pending"
    });

    if (exists) {
      return res.json({ message: "Request already sent" });
    }

    const request = await KeyRequest.create({
      from: fromId,
      to: toId
    });

    res.json({ message: "Key exchange request sent", request });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

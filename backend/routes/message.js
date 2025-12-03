// backend/routes/message.js
const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const mongoose = require("mongoose");
const authVerify = require("../middleware/authVerify");
const { logEvent } = require("../utils/logger");
// Multer for file uploads
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ensure uploads folder exists
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ------------------------------
// SEND ENCRYPTED MESSAGE (existing)
// ------------------------------
router.post("/send", async (req, res) => {
  try {
    const {
      sender,
      receiver,
      ciphertext,
      iv,
      salt,
      nonce,
      signature,
      counter,
    } = req.body;

    // Validate required fields
    if (!sender || !receiver || !ciphertext || !iv || !salt || counter == null) {
      return res.status(400).json({ error: "Missing required fields" });
    }
// --- REPLAY PROTECTION CHECK ---
/*const existing = await Message.findOne({
  sender,
  receiver,
  counter,
  nonce
});

if (existing) {
  console.log("⚠️ Replay attack detected!", existing);
  return res.status(409).json({
    error: "Replay detected - message was already sent"
  });
}*/

    const msg = new Message({
      sender: new mongoose.Types.ObjectId(sender),
      receiver: new mongoose.Types.ObjectId(receiver),
      ciphertext,
      iv,
      salt,
      nonce: nonce || "",
      signature: signature || "",
      counter,
      timestamp: new Date(),
    });

    const saved = await msg.save();
logEvent("MESSAGE_STORED", {
    messageId: saved._id,
    sender: sender,
    receiver: receiver,
    counter
});

    // Populate usernames for frontend
    const populated = await Message.findById(saved._id)
      .populate("sender", "username")
      .populate("receiver", "username");

    return res.json({ message: "Encrypted message stored", data: populated });
  } catch (err) {
    console.error("Message send error:", err);
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
});

// ------------------------------
// SEND FILE MESSAGE (NEW)
// ------------------------------
router.post("/send-file", authVerify, upload.single("file"), async (req, res) => {
  try {
    // authVerify attaches req.user { id, username }
    const sender = req.user.id;
    const { to } = req.body;

    if (!to) {
      return res.status(400).json({ error: "Missing 'to' field" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Build file path accessible by frontend:
    // ensure server serves /uploads as static (see server.js)
    const fileUrl = `/uploads/${req.file.filename}`;
    const fileName = req.file.originalname;

    const msg = new Message({
      sender: new mongoose.Types.ObjectId(sender),
      receiver: new mongoose.Types.ObjectId(to),
      ciphertext: null,
      iv: null,
      salt: null,
      nonce: "",
      signature: "",
      counter: 0,
      timestamp: new Date(),
      // add file fields (make sure your Message schema contains these)
      fileUrl,
      fileName,
    });

    const saved = await msg.save();

    const populated = await Message.findById(saved._id)
      .populate("sender", "username")
      .populate("receiver", "username");

    return res.json({ message: "File message stored", data: populated });
  } catch (err) {
    console.error("Send-file error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ------------------------------
// GET CHAT HISTORY (existing)
// ------------------------------
router.get("/history/:user1/:user2", async (req, res) => {
  try {
    const user1 = new mongoose.Types.ObjectId(req.params.user1);
    const user2 = new mongoose.Types.ObjectId(req.params.user2);

    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
    })
      .sort({ timestamp: 1 })
      .populate("sender", "username")
      .populate("receiver", "username");

    return res.json(messages);
  } catch (err) {
    console.error("Fetch history error:", err);
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
});

module.exports = router;

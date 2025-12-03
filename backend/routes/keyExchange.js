const express = require("express");
const router = express.Router();
const authVerify = require("../middleware/authVerify");
const mongoose = require("mongoose");
const KeyExchange = require("../models/KeyExchange");
const { logEvent } = require("../utils/logger");

/**
 * POST /api/key/request
 */
router.post("/request", authVerify, async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, senderPubEcdhJwk, senderPubSigningJwk } = req.body;

    if (!receiverId || !senderPubEcdhJwk) {
      return res.status(400).json({ error: "receiverId and senderPubEcdhJwk required" });
    }

    if (receiverId === senderId) {
      return res.status(400).json({ error: "Cannot send key request to yourself" });
    }

    // Prevent duplicate active requests
    const existing = await KeyExchange.findOne({
      sender: senderId,
      receiver: receiverId,
      status: "pending",
    });

    if (existing) {
      return res.status(400).json({ error: "Request already pending" });
    }

    const record = new KeyExchange({
      sender: new mongoose.Types.ObjectId(senderId),
      receiver: new mongoose.Types.ObjectId(receiverId),
      senderPubEcdhJwk,
      senderPubSigningJwk: senderPubSigningJwk || null,
      status: "pending",
      logs: [{ at: new Date(), event: "request_created", by: senderId }],
    });
logEvent("KEY_REQUEST_SENT", {
    sender: senderId,
    receiver: receiverId
});

    await record.save();

    return res.json({ message: "Key request created", id: record._id });
  } catch (err) {
    console.error("Key request error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
});
router.post("/request_insecure", async (req, res) => {
  res.json({ message: "MITM demo request declined", data: req.body });
});


/**
 * GET /api/key/requests/incoming
 */
router.get("/requests/incoming", authVerify, async (req, res) => {
  const userId = req.user.id;

  const requests = await KeyExchange.find({
    receiver: userId,
    status: "pending",
  }).populate("sender", "username");

  res.json(requests);
});

/**
 * POST /api/key/accept
 */
router.post("/accept", authVerify, async (req, res) => {
  try {
    const receiverId = req.user.id;
    const { requestId, receiverPubEcdhJwk, receiverPubSigningJwk } = req.body;

    if (!requestId || !receiverPubEcdhJwk) {
      return res.status(400).json({ error: "requestId and receiverPubEcdhJwk required" });
    }

    const reqDoc = await KeyExchange.findById(requestId);
    if (!reqDoc) return res.status(404).json({ error: "Request not found" });

    if (reqDoc.receiver.toString() !== receiverId) {
      return res.status(403).json({ error: "Not authorized to accept this request" });
    }

    reqDoc.receiverPubEcdhJwk = receiverPubEcdhJwk;
    reqDoc.receiverPubSigningJwk = receiverPubSigningJwk || null;
    reqDoc.status = "accepted";
    reqDoc.logs.push({ at: new Date(), event: "accepted", by: receiverId });

    await reqDoc.save();

    return res.json({
      message: "Key request accepted",
      requestId,
      senderPubEcdhJwk: reqDoc.senderPubEcdhJwk,
      senderPubSigningJwk: reqDoc.senderPubSigningJwk,
      receiverPubEcdhJwk,
    });
  } catch (err) {
    console.error("Accept error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * POST /api/key/reject
 */
router.post("/reject", authVerify, async (req, res) => {
  try {
    const { requestId } = req.body;

    if (!requestId) {
      return res.status(400).json({ message: "requestId required" });
    }

    const reqDoc = await KeyExchange.findById(requestId);
    if (!reqDoc) return res.status(404).json({ message: "Request not found" });

    if (reqDoc.receiver.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await KeyExchange.findByIdAndDelete(requestId);

    return res.json({ message: "Request rejected successfully" });
  } catch (err) {
    console.error("Reject error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

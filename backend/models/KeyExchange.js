// backend/models/KeyExchange.js
const mongoose = require("mongoose");

const KeyExchangeSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  senderPubEcdhJwk: { type: Object, required: true },
  senderPubSigningJwk: { type: Object },

  receiverPubEcdhJwk: { type: Object },
  receiverPubSigningJwk: { type: Object },

  status: { type: String, enum: ["pending", "accepted", "complete"], default: "pending" },

  logs: [
    {
      at: { type: Date, default: Date.now },
      event: { type: String },
      by: { type: String },
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("KeyExchange", KeyExchangeSchema);

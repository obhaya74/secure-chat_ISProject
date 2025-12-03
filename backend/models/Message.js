const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // --- Encryption Fields ---
  ciphertext: {
    type: String,
    //required: true,
  },
  iv: {
    type: String,
    //required: true,
  },

  // HKDF salt (base64)
  salt: {
    type: String,
    //required: true,
  },

  // Optional: Key confirmation nonce (base64)
  nonce: {
    type: String,
  },

  // Digital signature of the ciphertext+aad
  signature: {
    type: String,
  },

  // --- Replay Protection ---
  counter: {
    type: Number,
    required: true,
  },
fileUrl: { type: String, default: null },
fileName: { type: String, default: null },

  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Message", MessageSchema);

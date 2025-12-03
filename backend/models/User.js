const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // store public JWKs for other users to fetch
  pubSigningKeyJwk: { type: Object, default: null },
  pubEcdhKeyJwk: { type: Object, default: null }

}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);

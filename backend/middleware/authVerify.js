const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

    if (!token) return res.status(401).json({ error: "Missing token" });

    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ error: "Server JWT_SECRET not set" });

    const payload = jwt.verify(token, secret);

    // normalized user object
    req.user = {
      id: payload.id,
      _id: payload.id,
      username: payload.username
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token", details: err.message });
  }
};

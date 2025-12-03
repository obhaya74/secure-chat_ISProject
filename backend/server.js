const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api/auth", require("./routes/auth"));
app.use("/api/messages", require("./routes/message"));
app.use("/api/users", require("./routes/users"));
app.use("/api/key", require("./routes/keyExchange"));   // <--- FIXED FILE NAME
app.use('/uploads', express.static('uploads'));

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Secure Chat Backend Running...");
});

// CONNECT MONGO
mongoose.connect("mongodb://localhost:27017/securechat", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Connection Error:", err));

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

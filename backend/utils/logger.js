const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "../logs/security.log");

function logEvent(event, details = {}) {
  const entry = `[${new Date().toISOString()}] ${event} — ${JSON.stringify(details)}\n`;
  fs.appendFileSync(logFile, entry);
  console.log("[LOG]", entry);
}

module.exports = { logEvent };

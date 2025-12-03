import axios from "axios";
const { logEvent } = require("../utils/logger");
const API = "http://localhost:5000/api/keyrequest";

export async function sendKeyRequest(fromId, toId) {
  const res = await axios.post(`${API}/send`, { fromId, toId });
  logEvent("KEY_REQUEST_SENT", {
    sender: senderId,
    receiver: receiverId
});

  return res.data;

}

import axios from "axios";

const API = "http://localhost:5000/api/keyrequest";

export async function sendKeyRequest(fromId, toId) {
  const res = await axios.post(`${API}/send`, { fromId, toId });
  return res.data;
}

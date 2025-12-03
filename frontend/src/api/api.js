// src/api/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// 🔥 Attach token on every request
API.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- AUTH ---
export const signupUser = (data) => API.post("/auth/signup", data);

export const loginRequest = (data) =>
  API.post("/auth/login", data).then((res) => {
    if (res.data?.token) {
      sessionStorage.setItem("token", res.data.token);
    }
    return res.data;
  });

// --- KEY REQUESTS ---
export const sendKeyRequest = (data) =>
  API.post("/key/request", data).then((res) => res.data);

export const getIncomingRequests = async () => {
  const res = await axios.get(
    "http://localhost:5000/api/key/requests/incoming",
    {
      headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
    }
  );
 

  return res.data;
};

export const acceptKeyRequest = async (requestId, receiverPubKeys) => {
  const res = await axios.post(
    "http://localhost:5000/api/key/accept",
    {
      requestId,
      receiverPubEcdhJwk: receiverPubKeys.ecdh,
      receiverPubSigningJwk: receiverPubKeys.signing,
    },
    {
      headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
    }
  );
  
  return res.data;
};

export const rejectKeyRequest = async (requestId) => {
  const res = await axios.post(
    "http://localhost:5000/api/key/reject",
    { requestId },
    {
      headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
    }
  );
  return res.data;
};

// --- FILE MESSAGE (NEW) ---
export const sendFileMessage = async (to, file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("to", to);

  const res = await axios.post("http://localhost:5000/api/messages/send-file", formData, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

// --- OTHER APIS ---
export const sendMessageApi = (data) =>
  API.post("/messages/send", data);

export const getChatHistory = (u1, u2) =>
  API.get(`/messages/history/${u1}/${u2}`);

export default API;

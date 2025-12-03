// src/services/keyExchangeService.js
import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api" });

export const postKeyExchangeRequest = (payload) =>
  API.post("/key-exchange/request", payload).then(r => r.data);

export const getPendingRequests = (userId) =>
  API.get(`/key-exchange/pending/${userId}`).then(r => r.data);

export const acceptKeyExchange = (payload) =>
  API.post("/key-exchange/accept", payload).then(r => r.data);

export const getRequestById = (id) =>
  API.get(`/key-exchange/request/${id}`).then(r => r.data);

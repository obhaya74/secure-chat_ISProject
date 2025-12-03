import { create } from "zustand";

import {
  getIncomingRequests,
  acceptKeyRequest,
  rejectKeyRequest
} from "../api/api";

import { useChatStore } from "./useChatStore";
//const { logEvent } = require("../utils/logger");
const { logEvent }= require("../utils/logger")
export const useKeyRequestStore = create((set, get) => ({
  requests: [],
  loading: false,

  loadRequests: async () => {
    set({ loading: true });
    const list = await getIncomingRequests();
    set({ requests: list, loading: false });
  },

  accept: async (requestId, sender) => {
    try {
      const ecdhPub = localStorage.getItem("ecdhPublicKey");
      const signPub = localStorage.getItem("signingPublicKey");

      if (!ecdhPub || !signPub) {
        alert("Missing keypair!");
        return;
      }

      await acceptKeyRequest(requestId, {
        ecdh: JSON.parse(ecdhPub),
        signing: JSON.parse(signPub),
      });

      alert("Accepted!");

      await get().loadRequests();

      // 🔥 Mark this user as allowed to chat
      const chatStore = useChatStore.getState();
      chatStore.allowUser(sender._id);

      // 🔥 Auto-open chat
      chatStore.selectUser(sender);
      const myId = sessionStorage.getItem("userId");
      chatStore.fetchChatHistory(myId, sender._id);

    } catch (err) {
      console.error(err);
      alert("Failed to accept request");
    }
  },

  reject: async (requestId) => {
    try {
      await rejectKeyRequest(requestId);
      alert("Rejected.");
      await get().loadRequests();
    } catch (err) {
      console.error(err);
      alert("Failed to reject");
    }
  },
}));

import { create } from "zustand";
import axios from "axios";

export const useChatStore = create((set, get) => ({
  selectedUser: null,
  users: [],
  messages: {},

  // 🔥 allowedUsers = { userId: true }
  allowedUsers: {},

  allowUser: (userId) =>
    set((state) => ({
      allowedUsers: { ...state.allowedUsers, [userId]: true },
    })),

  selectUser: (user) => set({ selectedUser: user }),

  fetchUsers: async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ users: res.data });
    } catch (err) {
      console.error("Fetch users error:", err);
    }
  },

  fetchChatHistory: async (myId, otherId) => {
    const allowed = get().allowedUsers[otherId];
    if (!allowed) {
      console.log("⛔ Chat not allowed yet");
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:5000/api/messages/history/${myId}/${otherId}`
      );

      set((state) => ({
        messages: {
          ...state.messages,
          [otherId]: res.data,
        },
      }));
    } catch (err) {
      console.error("Fetch history error:", err);
    }
  },

  addMessage: (otherId, msg) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [otherId]: [...(state.messages[otherId] || []), msg],
      },
    }));
  },
}));

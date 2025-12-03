import { create } from "zustand";
import { generateKeyPair } from "../utils/generateKeyPair";

export const useAuthStore = create((set) => ({

  user: null,
  token: null,

  // Called after login
  setSession: async (session) => {
    // 1. Save auth info
    set({
      user: {
        username: session.user.username,
        _id: session.user._id,
        email: session.user.email,
      },
      token: session.token,
    });

    // 2. Save to localStorage
    sessionStorage.setItem("token", session.token);
sessionStorage.setItem("username", session.user.username);
sessionStorage.setItem("userId", session.user._id);
sessionStorage.setItem("email", session.user.email);


    // 3. Generate keys ONLY once if missing
    const alreadyHasKeys = localStorage.getItem("ecdhPrivateKey");

    if (!alreadyHasKeys) {
      console.log("🔑 Generating fresh key pairs...");
      await generateKeyPair(); // Stores keys into localStorage
    } else {
      console.log("🔐 Existing keys found in localStorage.");
    }
  },

  // Restore session on refresh
  restoreSession: () => {
    const token = sessionStorage.getItem("token");
const username = sessionStorage.getItem("username");
const userId = sessionStorage.getItem("userId");
const email = sessionStorage.getItem("email");


    if (!token || !userId) return;

    set({
      token,
      user: {
        username,
        _id: userId,
        email,
      },
    });
  },

  logout: () => {
    // Clear session data
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    localStorage.removeItem("email");

    // Clear keys too (optional)
    localStorage.removeItem("ecdhPrivateKey");
    localStorage.removeItem("ecdhPublicKey");
    localStorage.removeItem("signingPrivateKey");
    localStorage.removeItem("signingPublicKey");

    set({
      user: null,
      token: null,
    });
  }
}));

import React, { useState } from "react";
import { loginRequest } from "../api/api";

import {
  generateSigningKeyPair,
  generateLongTermEcdhPair,
  exportJwk
} from "../crypto/keys";

import { useAuthStore } from "../store/useAuthStore";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  const setSession = useAuthStore((s) => s.setSession);

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus("Logging in...");

    try {
      // 1️⃣ Login request
      const res = await loginRequest({ username, password });

      if (res.error) {
        setStatus(res.error);
        return;
      }

      const userId = res.id || res.user?._id;

      // 2️⃣ Store session in localStorage
      localStorage.setItem("token", res.token);
      localStorage.setItem("username", username);
      localStorage.setItem("userId", userId);

      // 3️⃣ Store server public keys
      localStorage.setItem(
        "server_pubSigningKey",
        JSON.stringify(res.pubSigningKeyJwk)
      );

      localStorage.setItem(
        "server_pubEcdhKey",
        JSON.stringify(res.pubEcdhKeyJwk)
      );

      // 4️⃣ Generate private keys
      setStatus("Generating private keys...");

      const signingPair = await generateSigningKeyPair();
      const signingPrivateJwk = await exportJwk(signingPair.privateKey);

      const ecdhPair = await generateLongTermEcdhPair();
      const ecdhPrivateJwk = await exportJwk(ecdhPair.privateKey);

      localStorage.setItem(
        "privateSigningKey",
        JSON.stringify(signingPrivateJwk)
      );

      localStorage.setItem(
        "privateEcdhKey",
        JSON.stringify(ecdhPrivateJwk)
      );

      // 5️⃣ Update zustand auth store
      setSession({
        username,
        userId,
        token: res.token,
      });

      setStatus("Login successful! Redirecting...");

      setTimeout(() => {
        window.location.href = "/chat";
      }, 500);

    } catch (err) {
      console.error("Login error:", err);
      setStatus("Login failed!");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Login</h2>

      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
          required
        /><br /><br />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br /><br />

        <button type="submit">Login</button>
      </form>

      <p>{status}</p>
    </div>
  );
}

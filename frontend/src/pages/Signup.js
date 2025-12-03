import React, { useState } from "react";
import { signupUser } from "../api/api";

import {
  generateSigningKeyPair,
  generateLongTermEcdhPair,
  exportJwk,
  saveKeyJwk,
} from "../crypto/keys";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const isDark =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const theme = {
    background: isDark ? "#0b141a" : "#f2f5f7",
    card: isDark ? "rgba(17, 23, 27, 0.6)" : "rgba(255, 255, 255, 0.55)",
    accent: "#25D366",
    text: isDark ? "#e8eef0" : "#111827",
    faded: isDark ? "#98a2a6" : "#6b7280",
    inputBg: isDark ? "rgba(15, 26, 29, 0.65)" : "rgba(255,255,255,0.7)",
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("Generating cryptographic keys...");

    try {
      const signingKeyPair = await generateSigningKeyPair();
      const ecdhKeyPair = await generateLongTermEcdhPair();

      const pubSigningKey = await exportJwk(signingKeyPair.publicKey);
      const pubEcdhKey = await exportJwk(ecdhKeyPair.publicKey);

      await saveKeyJwk("signingPrivateKey", await exportJwk(signingKeyPair.privateKey));
      await saveKeyJwk("ecdhPrivateKey", await exportJwk(ecdhKeyPair.privateKey));

      setStatus("Sending signup request to server...");

      const res = await signupUser({
        username,
        email,
        password,
        pubSigningKeyJwk: pubSigningKey,
        pubEcdhKeyJwk: pubEcdhKey,
      });

      setStatus(res?.data?.message || "Signup complete!");
      setLoading(false);
    } catch (err) {
      console.error("Signup error:", err);
      setStatus(err.message || "Signup failed");
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: "url('/images/bg2.jpeg')", // 🌟 ADDED BACKGROUND IMAGE
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        padding: 20,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
      }}
    >
      <div
        style={{
          width: 520,
          borderRadius: 16,
          padding: 28,
          background: theme.card, // 🌟 GLASS EFFECT
          backdropFilter: "blur(12px)", // 🌟 BLUR ADDED
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.45)",
          boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
        }}
      >
        <h2 style={{ marginTop: 0, color: theme.text }}>Create account</h2>
        <p style={{ color: theme.faded, marginTop: 6 }}>
          Signup securely — your private keys stay on this device.
        </p>

        <form onSubmit={handleSignup} style={{ marginTop: 12 }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              marginBottom: 12,
              border: "1px solid rgba(255,255,255,0.35)",
              background: theme.inputBg,
              color: theme.text,
            }}
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              marginBottom: 12,
              border: "1px solid rgba(255,255,255,0.35)",
              background: theme.inputBg,
              color: theme.text,
            }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              marginBottom: 14,
              border: "1px solid rgba(255,255,255,0.35)",
              background: theme.inputBg,
              color: theme.text,
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 10,
              background: theme.accent,
              color: "#05311B",
              fontWeight: 700,
              border: "none",
              cursor: loading ? "progress" : "pointer",
            }}
          >
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>

        <div style={{ marginTop: 12, color: theme.faded }}>
          <small>{status}</small>
        </div>

        <div
          style={{
            marginTop: 20,
            textAlign: "center",
            fontSize: 14,
            color: theme.faded,
          }}
        >
          Already have an account?{" "}
          <a
            href="/login"
            style={{
              color: theme.accent,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Login
          </a>
        </div>
      </div>
    </div>
  );
}

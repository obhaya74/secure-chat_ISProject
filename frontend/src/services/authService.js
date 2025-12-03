// src/services/authService.js
// Simple login service that returns the exact shape the UI expects.

export async function loginUser(username, password) {
  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    // Backend returned an error
    if (!res.ok) {
      // either data.error or data.message depending on backend
      const msg = data?.error || data?.message || "Login failed";
      throw new Error(msg);
    }

    // Data shape your backend currently sends:
    // {
    //   message: "Login successful",
    //   token: "...",
    //   user: { _id: "...", username: "...", email: "..." },
    //   pubSigningKeyJwk: {...},
    //   pubEcdhKeyJwk: {...}
    // }

    // Safety: normalize fields & ensure required values exist
    const token = data.token;
    const user = data.user || { _id: data.id || null, username: data.username || null };
    const pubSigningKeyJwk = data.pubSigningKeyJwk || null;
    const pubEcdhKeyJwk = data.pubEcdhKeyJwk || null;

    if (!token || !user?._id) {
      throw new Error("Invalid server response during login");
    }

    // Persist session essentials for other parts of the app
    localStorage.setItem("token", token);
    localStorage.setItem("username", user.username);
    localStorage.setItem("userId", user._id);

    // Save server public keys as raw JWK strings for later usage
    if (pubSigningKeyJwk) localStorage.setItem("serverPubSigning", JSON.stringify(pubSigningKeyJwk));
    if (pubEcdhKeyJwk) localStorage.setItem("serverPubEcdh", JSON.stringify(pubEcdhKeyJwk));

    // Return the full object the UI expects
    return {
      token,
      user,
      pubSigningKeyJwk,
      pubEcdhKeyJwk,
    };
  } catch (err) {
    // Re-throw so the caller can show an error message
    throw new Error(err.message || "Login failed");
  }
}

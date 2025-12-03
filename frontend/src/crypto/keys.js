// frontend/src/crypto/keys.js
// Secure key storage + JWK import/export + long-term key generation

// ---------------------------
// IndexedDB helper functions
// ---------------------------
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("SecureChatKeys", 1);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("keys")) db.createObjectStore("keys");
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveKeyJwk(name, jwk) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("keys", "readwrite");
    tx.objectStore("keys").put(jwk, name);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadKeyJwk(name) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("keys", "readonly");
    const req = tx.objectStore("keys").get(name);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

// ---------------------------
// Key generation
// ---------------------------

// Long-term ECDSA signing pair
export async function generateSigningKeyPair() {
  return await window.crypto.subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-256",
    },
    true,
    ["sign", "verify"]
  );
}

// Long-term identity ECDH pair
export async function generateLongTermEcdhPair() {
  return await window.crypto.subtle.generateKey(
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    true,
    ["deriveKey", "deriveBits"]
  );
}

// ---------------------------
// JWK handling
// ---------------------------

export async function exportJwk(key) {
  return await window.crypto.subtle.exportKey("jwk", key);
}

/**
 * Import JWK as a CryptoKey
 * Detects:
 *  ✔ ECDSA sign/verify keys
 *  ✔ ECDH derive keys
 */
export async function importJwk(jwk, usage = []) {
  if (!jwk || !jwk.kty) throw new Error("Invalid JWK");

  const isPrivate = !!jwk.d;

  // Determine algorithm automatically
  const isECDSA =
    usage.includes("sign") || usage.includes("verify");

  const isECDH =
    usage.includes("deriveBits") || usage.includes("deriveKey");

  const algorithm = isECDSA
    ? { name: "ECDSA", namedCurve: jwk.crv || "P-256" }
    : { name: "ECDH", namedCurve: jwk.crv || "P-256" };

  return await window.crypto.subtle.importKey(
    "jwk",
    jwk,
    algorithm,
    true,
    usage
  );
}

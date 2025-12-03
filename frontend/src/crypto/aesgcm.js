// frontend/src/crypto/aesgcm.js
// AES-GCM helpers: encrypt/decrypt strings with AAD support.
// Exports both encryptText/decryptText and aliases encryptWithAesGcm/decryptWithAesGcm
// Uses 96-bit IV and 128-bit tag (AES-GCM).

import { Buffer } from "buffer"; // if you get "Buffer is not defined" error, add polyfill as explained

// Generate 12-byte IV (96 bits) recommended for AES-GCM
export function generateIv() {
  return window.crypto.getRandomValues(new Uint8Array(12));
}

/**
 * Encrypt a UTF-8 string (or ArrayBuffer) with AES-GCM CryptoKey.
 * aadObj is converted to JSON and used as additional authenticated data (AAD).
 *
 * Returns:
 * {
 *   ciphertextB64: string,
 *   ivB64: string,
 *   aad: aadObj
 * }
 */
export async function encryptText(aesKey, plaintext, aadObj = {}) {
  const iv = generateIv();
  const encoder = new TextEncoder();
  const data = typeof plaintext === "string" ? encoder.encode(plaintext) : plaintext;
  const aad = encoder.encode(JSON.stringify(aadObj || {}));

  const ct = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv, additionalData: aad, tagLength: 128 },
    aesKey,
    data
  );

  return {
    ciphertextB64: Buffer.from(new Uint8Array(ct)).toString("base64"),
    ivB64: Buffer.from(iv).toString("base64"),
    aad: aadObj
  };
}

/**
 * Decrypt ciphertext (base64) using AES-GCM CryptoKey and the same AAD object.
 * Returns plaintext string (UTF-8).
 */
export async function decryptText(aesKey, ciphertextB64, ivB64, aadObj = {}) {
  const decoder = new TextDecoder();
  const ct = Uint8Array.from(Buffer.from(ciphertextB64, "base64"));
  const iv = Uint8Array.from(Buffer.from(ivB64, "base64"));
  const aad = new TextEncoder().encode(JSON.stringify(aadObj || {}));

  try {
    const plain = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv, additionalData: aad, tagLength: 128 },
      aesKey,
      ct
    );
    return decoder.decode(plain);
  } catch (err) {
    // bubble a clearer error
    throw new Error("AES-GCM decryption failed (authentication error or wrong key/IV/AAD)");
  }
}

/**
 * Backwards-compatible aliases (older code may call these names).
 */
export const encryptWithAesGcm = encryptText;
export const decryptWithAesGcm = decryptText;

export default { generateIv, encryptText, decryptText };

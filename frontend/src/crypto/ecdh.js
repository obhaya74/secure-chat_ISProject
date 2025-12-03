// frontend/src/crypto/ecdh.js
// ECDH helpers + HKDF -> AES key derivation + key-confirmation helper.
// Provides functions for:
//  - deriving shared bits from a local private CryptoKey + remote public CryptoKey
//  - importing remote public JWK and deriving bits
//  - HKDF derive with random salt (initiator) and derive with provided salt (responder)
//  - key confirmation HMAC tag generation (optional)

import { importJwk, exportJwk } from "./keys";
import { Buffer } from "buffer"; // polyfill if needed

// Derive raw shared bits given local private CryptoKey and remote public CryptoKey
// returns ArrayBuffer (bits)
export async function deriveSharedBits(privateKey, remotePublicKey) {
  const bits = await window.crypto.subtle.deriveBits(
    { name: "ECDH", public: remotePublicKey },
    privateKey,
    256 // 256 bits
  );
  return bits;
}

// Import remote public JWK and derive raw shared bits using local private CryptoKey
export async function deriveSharedBitsFromJwk(privateKey, remotePublicJwk) {
  // import remote public JWK as ECDH public key
  const remotePubKey = await importJwk(remotePublicJwk, ["deriveBits", "deriveKey"]);
  return await deriveSharedBits(privateKey, remotePubKey);
}

/**
 * HKDF-SHA256: Given raw sharedBits (ArrayBuffer), derive AES-GCM 256-bit CryptoKey.
 * This function is for the initiator: it generates a random salt and returns { aesKey, saltB64 }.
 *
 * - sharedBits: ArrayBuffer (raw ECDH bits)
 * - info: optional info bytes (text)
 *
 * Returns: { aesKey: CryptoKey, saltB64: string }
 */
export async function hkdfImportKey(sharedBits, info = "secure-chat session") {
  const ikm = await window.crypto.subtle.importKey("raw", sharedBits, "HKDF", false, ["deriveKey"]);
  const salt = window.crypto.getRandomValues(new Uint8Array(16)); // 16-byte salt
  const derivedKey = await window.crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt,
      info: new TextEncoder().encode(info)
    },
    ikm,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  return { derivedKey, saltB64: Buffer.from(salt).toString("base64") };
}

/**
 * hkdfDeriveWithSalt: Given sharedBits (ArrayBuffer) and a provided salt (base64),
 * derive the same AES-GCM CryptoKey (for the receiver).
 *
 * Returns: CryptoKey
 */
export async function hkdfDeriveWithSalt(sharedBits, saltB64, info = "secure-chat session") {
  const salt = Uint8Array.from(Buffer.from(saltB64, "base64"));
  const ikm = await window.crypto.subtle.importKey("raw", sharedBits, "HKDF", false, ["deriveKey"]);
  const derivedKey = await window.crypto.subtle.deriveKey(
    { name: "HKDF", hash: "SHA-256", salt, info: new TextEncoder().encode(info) },
    ikm,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  return derivedKey;
}

// Convenience: export ECDH public key to JWK
export async function exportPublicEcdh(key) {
  return await exportJwk(key);
}

// Convenience: import remote ECDH public JWK and return CryptoKey
export async function importRemoteEcdhPublic(jwk) {
  return await importJwk(jwk, ["deriveKey", "deriveBits"]);
}

/**
 * computeKeyConfirmation: optional small key confirmation using HMAC-SHA256
 * - cryptoKey: AES CryptoKey (or any symmetric key) to derive HMAC key from
 * - nonceB64: base64 nonce used in key exchange
 * Returns: base64 HMAC tag
 */
export async function computeKeyConfirmation(cryptoKey, nonceB64) {
  // export raw AES key bits
  const raw = await window.crypto.subtle.exportKey("raw", cryptoKey);
  // import as HMAC key
  const hmacKey = await window.crypto.subtle.importKey(
    "raw",
    raw,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const nonce = Buffer.from(nonceB64, "base64");
  const data = new Uint8Array([...nonce, ...new TextEncoder().encode("KC")]);
  const sig = await window.crypto.subtle.sign("HMAC", hmacKey, data);
  return Buffer.from(sig).toString("base64");
}

export default {
  deriveSharedBits,
  deriveSharedBitsFromJwk,
  hkdfImportKey,
  hkdfDeriveWithSalt,
  exportPublicEcdh,
  importRemoteEcdhPublic,
  computeKeyConfirmation
};

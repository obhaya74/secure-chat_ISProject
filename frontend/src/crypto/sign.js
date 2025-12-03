// src/crypto/sign.js
/**
 * Sign a message string using ECDSA P-256 + SHA-256.
 * privateSigningKey must be a CryptoKey usable for "sign"
 * Returns signature base64
 */
export async function signString(privateSigningKey, message) {
  const enc = new TextEncoder();
  const sig = await window.crypto.subtle.sign(
    { name: "ECDSA", hash: { name: "SHA-256" } },
    privateSigningKey,
    enc.encode(message)
  );
  return Buffer.from(new Uint8Array(sig)).toString("base64");
}

/**
 * Verify signature (base64) using publicSigningCryptoKey
 */
export async function verifySignature(publicSigningKey, message, signatureB64) {
  const sig = Uint8Array.from(Buffer.from(signatureB64, "base64"));
  const enc = new TextEncoder();
  return await window.crypto.subtle.verify(
    { name: "ECDSA", hash: { name: "SHA-256" } },
    publicSigningKey,
    sig,
    enc.encode(message)
  );
}

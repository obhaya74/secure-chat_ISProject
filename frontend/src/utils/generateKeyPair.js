export async function generateKeyPair() {
  console.log("🔑 Generating ECDH + Ed25519 key pairs...");

  // ------------------------
  // ECDH (for encryption)
  // ------------------------
  const ecdh = await window.crypto.subtle.generateKey(
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    true,
    ["deriveKey", "deriveBits"]
  );

  const ecdhPublicJwk = await crypto.subtle.exportKey("jwk", ecdh.publicKey);
  const ecdhPrivateJwk = await crypto.subtle.exportKey("jwk", ecdh.privateKey);

  localStorage.setItem("ecdhPublicKey", JSON.stringify(ecdhPublicJwk));
  localStorage.setItem("ecdhPrivateKey", JSON.stringify(ecdhPrivateJwk));

  // ------------------------
  // Ed25519 (for signing)
  // ------------------------
  const signing = await crypto.subtle.generateKey(
    {
      name: "Ed25519",
    },
    true,
    ["sign", "verify"]
  );

  const signingPublicJwk = await crypto.subtle.exportKey("jwk", signing.publicKey);
  const signingPrivateJwk = await crypto.subtle.exportKey("jwk", signing.privateKey);

  localStorage.setItem("signingPublicKey", JSON.stringify(signingPublicJwk));
  localStorage.setItem("signingPrivateKey", JSON.stringify(signingPrivateJwk));

  console.log("✅ Key pairs generated & stored.");
}

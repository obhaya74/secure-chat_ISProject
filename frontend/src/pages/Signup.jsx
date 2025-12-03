// snippet for Signup submit handler (React)
import { generateSigningKeyPair, generateLongTermEcdhPair, exportJwk, saveKeyJwk } from "../crypto/keys";
import { signupUser } from "../api/api";

async function handleSignup(form) {
  // 1) generate two long-term keys
  const signKp = await generateSigningKeyPair();
  const ecdhKp = await generateLongTermEcdhPair();

  // 2) export public JWKs
  const pubSignJwk = await exportJwk(signKp.publicKey);
  const pubEcdhJwk = await exportJwk(ecdhKp.publicKey);

  // 3) export private JWKs (we will store them in IndexedDB)
  const privSignJwk = await exportJwk(signKp.privateKey);
  const privEcdhJwk = await exportJwk(ecdhKp.privateKey);

  // 4) save private jwks to IndexedDB locally (never send private keys to server)
  await saveKeyJwk("privSign", privSignJwk);
  await saveKeyJwk("privEcdh", privEcdhJwk);

  // 5) call signup API and send public keys
  const payload = {
    username: form.username,
    email: form.email,
    password: form.password,
    pubSigningKeyJwk: pubSignJwk,
    pubEcdhKeyJwk: pubEcdhJwk
  };

  await signupUser(payload);
  // handle response and redirect to login
}

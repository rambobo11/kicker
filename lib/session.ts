export const SESSION_COOKIE = "kicker_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function bytesToBase64Url(bytes: ArrayBuffer) {
  const view = new Uint8Array(bytes);
  let binary = "";
  for (const byte of view) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

async function sign(secret: string, value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value),
  );
  return bytesToBase64Url(signature);
}

function sameString(left: string, right: string) {
  const a = new TextEncoder().encode(left);
  const b = new TextEncoder().encode(right);
  const length = Math.max(a.length, b.length);
  let mismatch = a.length === b.length ? 0 : 1;
  for (let index = 0; index < length; index += 1) {
    mismatch |= (a[index] ?? 0) ^ (b[index] ?? 0);
  }
  return mismatch === 0;
}

export async function createSessionToken(secret: string, now = Date.now()) {
  const expiresAt = now + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = `v1.${expiresAt}`;
  const signature = await sign(secret, payload);
  return `${payload}.${signature}`;
}

export async function verifySessionToken(token: string | undefined, secret: string) {
  if (!token) return false;
  const [version, expiresAt, signature] = token.split(".");
  if (version !== "v1" || !expiresAt || !signature) return false;
  if (Number(expiresAt) < Date.now()) return false;
  const expected = await sign(secret, `${version}.${expiresAt}`);
  return sameString(signature, expected);
}

export function passwordsMatch(input: string, expected: string) {
  return sameString(input, expected);
}

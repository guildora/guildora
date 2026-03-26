import crypto from "node:crypto";

/**
 * Signs a token ID + expiry into an HMAC string.
 * Format: base64url(tokenId:expiresAtISO).base64url(hmac)
 */
export function signTokenId(tokenId: string, expiresAt: Date, secret: string): string {
  const payload = `${tokenId}:${expiresAt.toISOString()}`;
  const payloadB64 = Buffer.from(payload, "utf8").toString("base64url");
  const hmac = crypto.createHmac("sha256", secret).update(payloadB64).digest("base64url");
  return `${payloadB64}.${hmac}`;
}

/**
 * Verifies a signed token string and extracts the token ID + expiry.
 * Returns null if the signature is invalid.
 */
export function verifyTokenSignature(
  token: string,
  secret: string
): { tokenId: string; expiresAt: Date } | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, providedHmac] = parts;
  const expectedHmac = crypto.createHmac("sha256", secret).update(payloadB64).digest("base64url");

  const expectedBuf = Buffer.from(expectedHmac, "utf8");
  const providedBuf = Buffer.from(providedHmac, "utf8");
  if (expectedBuf.length !== providedBuf.length || !crypto.timingSafeEqual(expectedBuf, providedBuf)) {
    return null;
  }

  try {
    const payload = Buffer.from(payloadB64, "base64url").toString("utf8");
    const colonIndex = payload.indexOf(":");
    if (colonIndex === -1) return null;

    const tokenId = payload.slice(0, colonIndex);
    const expiresAtStr = payload.slice(colonIndex + 1);
    if (!tokenId || !expiresAtStr) return null;

    const expiresAt = new Date(expiresAtStr);
    if (Number.isNaN(expiresAt.getTime())) return null;

    return { tokenId, expiresAt };
  } catch {
    return null;
  }
}

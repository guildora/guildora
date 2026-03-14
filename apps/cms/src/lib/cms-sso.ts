import crypto from "node:crypto";

export interface CmsSsoPayload {
  sub: string;
  displayName: string;
  cmsRole: "admin" | "moderator";
  iat: number;
  exp: number;
}

function parsePayload(encodedPayload: string): CmsSsoPayload | null {
  try {
    const decoded = Buffer.from(encodedPayload, "base64url").toString("utf8");
    const parsed = JSON.parse(decoded) as Partial<CmsSsoPayload>;
    if (
      typeof parsed.sub !== "string" ||
      typeof parsed.displayName !== "string" ||
      (parsed.cmsRole !== "admin" && parsed.cmsRole !== "moderator") ||
      typeof parsed.iat !== "number" ||
      typeof parsed.exp !== "number"
    ) {
      return null;
    }

    return {
      sub: parsed.sub,
      displayName: parsed.displayName,
      cmsRole: parsed.cmsRole,
      iat: parsed.iat,
      exp: parsed.exp
    };
  } catch {
    return null;
  }
}

export function verifyCmsSsoToken(token: string, secret: string): CmsSsoPayload | null {
  const [encodedPayload, providedSignature] = token.split(".");
  if (!encodedPayload || !providedSignature) {
    return null;
  }

  const expectedSignature = crypto.createHmac("sha256", secret).update(encodedPayload).digest("base64url");
  const expectedBuffer = Buffer.from(expectedSignature);
  const providedBuffer = Buffer.from(providedSignature);
  if (expectedBuffer.length !== providedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, providedBuffer)) {
    return null;
  }

  const payload = parsePayload(encodedPayload);
  if (!payload) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp <= now || payload.iat > now + 30) {
    return null;
  }

  return payload;
}

export function createSsoUserEmail(userId: string): string {
  return `ngp-${userId}@sso.newguild.local`;
}

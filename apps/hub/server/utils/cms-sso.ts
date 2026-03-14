import crypto from "node:crypto";

export interface CmsSsoPayload {
  sub: string;
  displayName: string;
  cmsRole: "admin" | "moderator";
  iat: number;
  exp: number;
}

function base64UrlEncode(input: string) {
  return Buffer.from(input, "utf8").toString("base64url");
}

export function createCmsSsoToken(payload: CmsSsoPayload, secret: string): string {
  const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto.createHmac("sha256", secret).update(payloadEncoded).digest("base64url");
  return `${payloadEncoded}.${signature}`;
}

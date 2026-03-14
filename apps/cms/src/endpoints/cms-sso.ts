import crypto from "node:crypto";
import type { Endpoint, PayloadRequest } from "payload";
import { APIError, generatePayloadCookie, headersWithCors } from "payload";
import { createSsoUserEmail, verifyCmsSsoToken } from "../lib/cms-sso";

function getSearchParams(req: PayloadRequest): URLSearchParams {
  const baseUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL || "http://localhost:3002";
  return new URL(req.url || "/", baseUrl).searchParams;
}

function resolveReturnTo(searchParams: URLSearchParams): string {
  const returnTo = searchParams.get("returnTo");
  if (!returnTo || !returnTo.startsWith("/") || returnTo.startsWith("//")) {
    return "/admin";
  }
  return returnTo;
}

export const cmsSsoEndpoint: Endpoint = {
  path: "/sso",
  method: "get",
  handler: async (req) => {
    const ssoSecret = process.env.CMS_SSO_SECRET;
    if (!ssoSecret) {
      throw new APIError("CMS_SSO_SECRET is not configured.", 503);
    }

    const searchParams = getSearchParams(req);
    const token = searchParams.get("token");
    if (!token) {
      throw new APIError("Missing token.", 400);
    }

    const payload = verifyCmsSsoToken(token, ssoSecret);
    if (!payload) {
      throw new APIError("Invalid token.", 401);
    }

    const email = createSsoUserEmail(payload.sub);
    // Rotate to a fresh random password for each SSO login.
    // This avoids deterministic userId-derived credentials.
    const password = crypto.randomBytes(32).toString("hex");

    const existingUsers = await req.payload.find({
      collection: "users",
      where: {
        email: {
          equals: email
        }
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      req
    });

    if (existingUsers.docs[0]) {
      await req.payload.update({
        collection: "users",
        id: existingUsers.docs[0].id,
        data: {
          displayName: payload.displayName,
          roles: [payload.cmsRole],
          password
        },
        overrideAccess: true,
        req
      });
    } else {
      await req.payload.create({
        collection: "users",
        data: {
          email,
          password,
          displayName: payload.displayName,
          roles: [payload.cmsRole]
        },
        overrideAccess: true,
        req
      });
    }

    const loginResult = await req.payload.login({
      collection: "users",
      data: {
        email,
        password
      },
      req
    });

    const usersCollection = req.payload.config.collections.find((collection) => collection.slug === "users");
    if (!usersCollection?.auth) {
      throw new APIError("Users auth config is missing.", 500);
    }

    const returnTo = resolveReturnTo(searchParams);
    if (!loginResult.token) {
      throw new APIError("Login did not return a token.", 500);
    }
    const headers = headersWithCors({
      headers: new Headers(),
      req
    });
    headers.set(
      "Set-Cookie",
      generatePayloadCookie({
        collectionAuthConfig: usersCollection.auth,
        cookiePrefix: req.payload.config.cookiePrefix,
        token: loginResult.token
      })
    );
    headers.set("Location", returnTo);
    headers.set("Cache-Control", "no-store");

    return new Response(null, {
      status: 302,
      headers
    });
  }
};

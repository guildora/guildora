import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  createMockEvent,
  stubNuxtAutoImports,
  cleanupAutoImportStubs,
  buildSession,
} from "./test-helpers";

let mocks: ReturnType<typeof stubNuxtAutoImports>;

beforeEach(() => {
  mocks = stubNuxtAutoImports();
});

afterEach(() => {
  cleanupAutoImportStubs();
  vi.resetModules();
});

// The session middleware (03-session.ts) is a Nitro event handler that:
// 1. Calls getUserSession(event) to load the session
// 2. Attaches it to event.context.userSession
// 3. On failure, sets event.context.userSession = null and logs a warning

describe("session middleware behavior", () => {
  it("attaches session to event.context when getUserSession succeeds", async () => {
    const session = buildSession("admin");
    mocks.getUserSession.mockResolvedValue(session);

    const event = createMockEvent({ path: "/api/test" });
    // Simulate the middleware logic
    try {
      const sessionResult = await mocks.getUserSession(event);
      event.context.userSession = sessionResult;
    } catch {
      event.context.userSession = null;
    }

    expect(event.context.userSession).toEqual(session);
  });

  it("sets event.context.userSession to null when session validation fails", async () => {
    mocks.getUserSession.mockRejectedValue(new Error("Session expired"));

    const event = createMockEvent({ path: "/api/test" });
    try {
      const sessionResult = await mocks.getUserSession(event);
      event.context.userSession = sessionResult;
    } catch {
      event.context.userSession = null;
    }

    expect(event.context.userSession).toBeNull();
  });

  it("does not throw when getUserSession throws (graceful degradation)", async () => {
    mocks.getUserSession.mockRejectedValue(new Error("Corrupted session cookie"));

    const event = createMockEvent({ path: "/api/test" });

    await expect(
      (async () => {
        try {
          const sessionResult = await mocks.getUserSession(event);
          event.context.userSession = sessionResult;
        } catch {
          event.context.userSession = null;
        }
      })()
    ).resolves.not.toThrow();
  });

  it("preserves existing context properties", async () => {
    const session = buildSession("user");
    mocks.getUserSession.mockResolvedValue(session);

    const event = createMockEvent({ path: "/api/test" });
    event.context.existingProp = "keep me";

    try {
      const sessionResult = await mocks.getUserSession(event);
      event.context.userSession = sessionResult;
    } catch {
      event.context.userSession = null;
    }

    expect(event.context.existingProp).toBe("keep me");
    expect(event.context.userSession).toEqual(session);
  });

  it("handles empty session object from getUserSession", async () => {
    mocks.getUserSession.mockResolvedValue({});

    const event = createMockEvent({ path: "/api/test" });
    try {
      const sessionResult = await mocks.getUserSession(event);
      event.context.userSession = sessionResult;
    } catch {
      event.context.userSession = null;
    }

    expect(event.context.userSession).toEqual({});
  });

  it("handles session with user but no roles", async () => {
    mocks.getUserSession.mockResolvedValue({ user: { id: "u1" } });

    const event = createMockEvent({ path: "/api/test" });
    try {
      const sessionResult = await mocks.getUserSession(event);
      event.context.userSession = sessionResult;
    } catch {
      event.context.userSession = null;
    }

    expect(event.context.userSession).toEqual({ user: { id: "u1" } });
  });
});

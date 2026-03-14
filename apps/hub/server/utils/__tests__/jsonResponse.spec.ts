import { describe, expect, it } from "vitest";
import { jsonResponse, sanitizeForJson } from "../jsonResponse";

describe("json response utils", () => {
  it("serializes nested dates and bigint values", async () => {
    const body = {
      createdAt: new Date("2026-03-13T10:11:12.000Z"),
      stats: {
        count: 3n
      }
    };

    const response = jsonResponse(body);

    expect(response.headers.get("content-type")).toBe("application/json;charset=UTF-8");
    await expect(response.json()).resolves.toEqual({
      createdAt: "2026-03-13T10:11:12.000Z",
      stats: {
        count: "3"
      }
    });
  });

  it("keeps enumerable values from null-prototype objects", () => {
    const customFields = Object.create(null) as Record<string, unknown>;
    customFields.note = "keep me";
    customFields.toISOString = "not-a-function";

    expect(sanitizeForJson({ customFields })).toEqual({
      customFields: {
        note: "keep me",
        toISOString: "not-a-function"
      }
    });
  });

  it("strips unsafe toJSON functions that would throw", () => {
    const custom = { foo: "bar" } as Record<string, unknown>;
    custom.toJSON = Date.prototype.toJSON;

    expect(() => JSON.stringify(custom)).toThrow();
    expect(sanitizeForJson({ custom })).toEqual({
      custom: { foo: "bar" }
    });
    expect(() => JSON.stringify(sanitizeForJson({ custom }))).not.toThrow();
  });
});

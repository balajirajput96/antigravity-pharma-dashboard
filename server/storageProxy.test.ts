import type { Express, RequestHandler } from "express";
import { describe, expect, it, vi } from "vitest";
import { registerStorageProxy } from "./_core/storageProxy";

describe("storage proxy route", () => {
  it("uses Express 5 named wildcard syntax and rejects an empty key", async () => {
    let registeredPath = "";
    let handler: RequestHandler | undefined;

    const app = {
      get: (path: string, registeredHandler: RequestHandler) => {
        registeredPath = path;
        handler = registeredHandler;
      },
    } as unknown as Express;

    registerStorageProxy(app);

    expect(registeredPath).toBe("/manus-storage/*key");
    expect(handler).toBeDefined();

    const status = vi.fn().mockReturnThis();
    const send = vi.fn();
    await handler!(
      { params: {} } as never,
      { status, send } as never,
      () => undefined
    );

    expect(status).toHaveBeenCalledWith(400);
    expect(send).toHaveBeenCalledWith("Missing storage key");
  });
});

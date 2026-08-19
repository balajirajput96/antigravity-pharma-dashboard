import { describe, expect, it, vi } from "vitest";

vi.mock("./_core/env", () => ({
  ENV: {
    ownerOpenId: "balaji-owner-id",
  },
}));

import { appRouter } from "./routers";
import { requireOwner } from "./owner";

const ownerUser = {
  id: 1,
  openId: "balaji-owner-id",
  email: "balajirajputparuluniversity@gmail.com",
  name: "Balaji Rajput",
  loginMethod: "manus",
  role: "user",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

function createContext(user: typeof ownerUser) {
  return {
    user,
    req: { protocol: "https", headers: {} },
    res: { clearCookie: vi.fn() },
  } as any;
}

describe("private workspace owner gate", () => {
  it("accepts only the configured Balaji Rajput owner identity", () => {
    expect(requireOwner(ownerUser as any)).toEqual(ownerUser);
    expect(() =>
      requireOwner({ ...ownerUser, openId: "another-user" } as any)
    ).toThrow("This private workspace is available only to Balaji Rajput.");
    expect(() => requireOwner(null)).toThrow(
      "This private workspace is available only to Balaji Rajput."
    );
  });

  it("blocks a non-owner before a Confirm & Send action can reach delivery logic", async () => {
    const caller = appRouter.createCaller(
      createContext({ ...ownerUser, openId: "another-user" })
    );

    await expect(
      caller.workspace.confirmAndSend({ draftId: 1 })
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });
});

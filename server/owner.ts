import { TRPCError } from "@trpc/server";
import { ENV } from "./_core/env";
import type { AuthenticatedUser } from "./_core/sdk";

export const OWNER_NAME = "Balaji Rajput";

export function requireOwner(user: AuthenticatedUser | null | undefined) {
  if (!user || user.isCron || user.openId !== ENV.ownerOpenId) {
    throw new TRPCError({ code: "FORBIDDEN", message: "This private workspace is available only to Balaji Rajput." });
  }
  return user;
}

export function isOwnerOpenId(openId: string) {
  return Boolean(ENV.ownerOpenId) && openId === ENV.ownerOpenId;
}

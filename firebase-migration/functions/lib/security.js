import { getAuth } from "firebase-admin/auth";
import { HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
export const ownerEmailSecret = defineSecret("OWNER_EMAIL");
function normalized(value) {
  return value?.trim().toLowerCase() ?? "";
}
/**
 * Only callable-function code may issue the custom owner claim. Firestore and
 * Storage rules then require this claim plus the matching owner UID path.
 */
export async function requireWorkspaceOwner(uid) {
  const ownerEmail = normalized(ownerEmailSecret.value());
  if (!ownerEmail) {
    throw new HttpsError(
      "failed-precondition",
      "OWNER_EMAIL has not been configured server-side."
    );
  }
  const auth = getAuth();
  const user = await auth.getUser(uid);
  if (normalized(user.email) !== ownerEmail) {
    throw new HttpsError(
      "permission-denied",
      "This private workspace is available only to its owner."
    );
  }
  if (user.customClaims?.privateWorkspaceOwner !== true) {
    await auth.setCustomUserClaims(uid, {
      ...user.customClaims,
      privateWorkspaceOwner: true,
    });
  }
  return { ownerUid: uid };
}

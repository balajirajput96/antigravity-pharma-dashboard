import { initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { ownerEmailSecret, requireWorkspaceOwner } from "./security.js";
import { canRecordConfirmationHold, isApprovedImport } from "./policy.js";
initializeApp();
export const ownerBootstrap = onCall({ secrets: [ownerEmailSecret] }, async (request) => {
    if (!request.auth)
        throw new HttpsError("unauthenticated", "Google sign-in is required.");
    const { ownerUid } = await requireWorkspaceOwner(request.auth.uid);
    return { ownerUid, claimRefreshRequired: true };
});
/**
 * Records an explicit owner confirmation while delivery remains disabled.
 * There is intentionally no email, Gmail, HTTP, or form-submission code here.
 */
export const recordConfirmationHold = onCall({ secrets: [ownerEmailSecret] }, async (request) => {
    if (!request.auth)
        throw new HttpsError("unauthenticated", "Google sign-in is required.");
    const { ownerUid } = await requireWorkspaceOwner(request.auth.uid);
    const draftId = String(request.data?.draftId ?? "").trim();
    if (!draftId)
        throw new HttpsError("invalid-argument", "A draft ID is required.");
    const db = getFirestore();
    const draftRef = db.doc(`owners/${ownerUid}/drafts/${draftId}`);
    const eventRef = db.collection(`owners/${ownerUid}/deliveryEvents`).doc();
    await db.runTransaction(async (transaction) => {
        const draft = await transaction.get(draftRef);
        if (!draft.exists)
            throw new HttpsError("not-found", "Draft not found.");
        const status = String(draft.data()?.status ?? "");
        if (!canRecordConfirmationHold(status, false)) {
            throw new HttpsError("failed-precondition", "Only a Prepared draft can be confirmed while delivery is disabled.");
        }
        transaction.set(eventRef, {
            draftId,
            eventType: "confirmation-held",
            details: "Owner explicitly confirmed; no delivery provider is configured, so no message was sent.",
            createdAt: Timestamp.now(),
        });
    });
    return { delivery: "not-sent", event: "confirmation-held" };
});
/**
 * Validates a future owner-only file-import request without uploading any data.
 */
export const validateApprovedImport = onCall({ secrets: [ownerEmailSecret] }, async (request) => {
    if (!request.auth)
        throw new HttpsError("unauthenticated", "Google sign-in is required.");
    await requireWorkspaceOwner(request.auth.uid);
    const kind = String(request.data?.kind ?? "");
    const mimeType = String(request.data?.mimeType ?? "");
    if (!isApprovedImport(kind, mimeType)) {
        throw new HttpsError("invalid-argument", "Only approved Hindi reports and JSONL audit files may be imported.");
    }
    return { accepted: true, uploadPathTemplate: "owners/{ownerUid}/workspace/{fileId}" };
});

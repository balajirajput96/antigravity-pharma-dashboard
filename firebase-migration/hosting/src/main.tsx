import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import {
  collection,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  type DocumentData,
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import {
  BadgeCheck,
  FileJson2,
  FileText,
  LockKeyhole,
  LogIn,
  LogOut,
  RefreshCw,
  Send,
  ShieldCheck,
} from "lucide-react";
import {
  WORKFLOW_STATUS,
  mayRecordConfirmationHold,
  ownerDataPath,
} from "../../../shared/firebaseHostingPolicy";
import "./styles.css";

type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
};

type WorkspaceDraft = {
  id: string;
  company?: string;
  role?: string;
  status?: string;
  createdAt?: { toDate?: () => Date };
};

type WorkspaceFile = {
  id: string;
  kind?: string;
  filename?: string;
};

const requiredConfig = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_APP_ID",
] as const;
const configured = requiredConfig.every(key => Boolean(import.meta.env[key]));
const firebaseConfig: FirebaseConfig | null = configured
  ? {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
      appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
    }
  : null;

const firebaseApp = firebaseConfig
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;
const auth = firebaseApp ? getAuth(firebaseApp) : null;
const db = firebaseApp ? getFirestore(firebaseApp) : null;
const functions = firebaseApp
  ? getFunctions(
      firebaseApp,
      (import.meta.env.VITE_FIREBASE_REGION as string | undefined) ??
        "asia-south1"
    )
  : null;

function readableDate(value?: { toDate?: () => Date }) {
  return value?.toDate?.().toLocaleString() ?? "Not recorded";
}

function asRows<T>(rows: DocumentData[]) {
  return rows.map(row => ({ id: row.id, ...row.data() }) as T);
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [ownerReady, setOwnerReady] = useState(false);
  const [status, setStatus] = useState(
    "Private workspace is locked until the owner signs in."
  );
  const [drafts, setDrafts] = useState<WorkspaceDraft[]>([]);
  const [files, setFiles] = useState<WorkspaceFile[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, current => {
      setUser(current);
      setOwnerReady(false);
      if (!current)
        setStatus("Private workspace is locked until the owner signs in.");
    });
  }, []);

  const welcomeName = useMemo(
    () => user?.displayName?.trim() || "Owner",
    [user]
  );

  async function bootstrapOwner() {
    if (!user || !functions) return;
    setBusy(true);
    try {
      await httpsCallable(functions, "ownerBootstrap")({});
      await user.getIdToken(true);
      setOwnerReady(true);
      setStatus("Owner-only access is active. Delivery remains disabled.");
    } catch (error) {
      setOwnerReady(false);
      setStatus(
        error instanceof Error
          ? error.message
          : "Owner access could not be established."
      );
    } finally {
      setBusy(false);
    }
  }

  async function refreshWorkspace() {
    if (!user || !db || !ownerReady) return;
    setBusy(true);
    try {
      const root = ownerDataPath(user.uid);
      const [draftSnapshot, fileSnapshot] = await Promise.all([
        getDocs(
          query(
            collection(db, root, "drafts"),
            orderBy("createdAt", "desc"),
            limit(12)
          )
        ),
        getDocs(
          query(
            collection(db, root, "workspaceFiles"),
            orderBy("createdAt", "desc"),
            limit(12)
          )
        ),
      ]);
      setDrafts(asRows<WorkspaceDraft>(draftSnapshot.docs));
      setFiles(asRows<WorkspaceFile>(fileSnapshot.docs));
      setStatus("Workspace refreshed. No outreach has been sent.");
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Workspace records could not be read."
      );
    } finally {
      setBusy(false);
    }
  }

  async function holdConfirmation(draft: WorkspaceDraft) {
    if (
      !functions ||
      !mayRecordConfirmationHold(String(draft.status ?? ""), false)
    )
      return;
    setBusy(true);
    try {
      const response = await httpsCallable(
        functions,
        "recordConfirmationHold"
      )({ draftId: draft.id });
      const data = response.data as { delivery?: string; event?: string };
      setStatus(
        data.delivery === "not-sent"
          ? "Confirmation recorded. No message was sent because delivery is disabled."
          : "Confirmation state updated."
      );
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Confirmation could not be recorded."
      );
    } finally {
      setBusy(false);
    }
  }

  if (!firebaseConfig) {
    return <SetupRequired />;
  }

  return (
    <main className="shell">
      <aside className="rail">
        <div className="brand">
          <span className="brand-mark">A</span>
          <span>
            Antigravity
            <br />
            <strong>Pharma</strong>
          </span>
        </div>
        <div className="rail-caption">PRIVATE WORKSPACE</div>
        <div className="rail-item active">
          <ShieldCheck size={17} /> Owner-only safeguards
        </div>
        <div className="rail-note">
          Firebase migration target
          <br />
          No data imported yet
        </div>
      </aside>
      <section className="canvas">
        <header className="topbar">
          <div>
            <p className="eyebrow">PRIVATE QA / IPQA / QMS JOB WORKSPACE</p>
            <h1>Welcome, {welcomeName}</h1>
          </div>
          {user ? (
            <button
              className="outline"
              onClick={() => signOut(auth!)}
              disabled={busy}
            >
              <LogOut size={16} /> Sign out
            </button>
          ) : (
            <button
              className="dark"
              onClick={() => signInWithPopup(auth!, new GoogleAuthProvider())}
            >
              <LogIn size={16} /> Sign in with Google
            </button>
          )}
        </header>
        <section className="safety-card">
          <div className="safety-icon">
            <LockKeyhole size={21} />
          </div>
          <div>
            <p className="eyebrow">ALWAYS-ON SAFETY RULES</p>
            <h2>Review and prepare only. Never send automatically.</h2>
            <p>
              No email, web form, account login, OTP, password, bank data,
              Aadhaar, PAN, attachments, or private documents are used by this
              workspace.
            </p>
          </div>
        </section>
        <section className="status-card">
          <BadgeCheck size={19} />
          <span>{status}</span>
        </section>
        {!user ? (
          <section className="empty">
            <ShieldCheck size={30} />
            <h2>Owner authentication required</h2>
            <p>
              Sign in with the configured owner Google account. The server
              compares the account against the private `OWNER_EMAIL` secret
              before issuing access.
            </p>
          </section>
        ) : !ownerReady ? (
          <section className="empty">
            <ShieldCheck size={30} />
            <h2>Activate owner-only access</h2>
            <p>
              Access claims are server-issued. This does not upload files or
              send communication.
            </p>
            <button className="dark" onClick={bootstrapOwner} disabled={busy}>
              {busy ? "Activating…" : "Activate owner access"}
            </button>
          </section>
        ) : (
          <>
            <section className="workspace-head">
              <div>
                <p className="eyebrow">MIGRATION WORKSPACE</p>
                <h2>Approved records only</h2>
                <p>
                  Imports remain disabled until a reviewed owner-only migration
                  action is configured.
                </p>
              </div>
              <button
                className="outline"
                onClick={refreshWorkspace}
                disabled={busy}
              >
                <RefreshCw size={16} className={busy ? "spin" : ""} /> Refresh
                workspace
              </button>
            </section>
            <section className="grid">
              <article className="panel">
                <div className="panel-title">
                  <span>
                    <Send size={17} /> Outreach drafts
                  </span>
                  <span className="count">{drafts.length}</span>
                </div>
                {drafts.length ? (
                  drafts.map(draft => (
                    <div className="draft" key={draft.id}>
                      <div>
                        <strong>{draft.company ?? "Unlabelled company"}</strong>
                        <p>
                          {draft.role ?? "Role pending"} ·{" "}
                          {readableDate(draft.createdAt)}
                        </p>
                        <span
                          className={
                            draft.status === WORKFLOW_STATUS.prepared
                              ? "badge prepared"
                              : "badge"
                          }
                        >
                          {draft.status ?? "Prepared"}
                        </span>
                      </div>
                      {mayRecordConfirmationHold(
                        String(draft.status ?? ""),
                        false
                      ) ? (
                        <button
                          className="hold"
                          disabled={busy}
                          onClick={() => holdConfirmation(draft)}
                        >
                          Record confirmation
                        </button>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <p className="quiet">
                    No approved drafts imported. This page cannot create or send
                    an outreach message.
                  </p>
                )}
              </article>
              <article className="panel">
                <div className="panel-title">
                  <span>
                    <FileText size={17} /> Workspace files
                  </span>
                  <span className="count">{files.length}</span>
                </div>
                {files.length ? (
                  files.map(file => (
                    <div className="file" key={file.id}>
                      {file.kind === "jsonl-audit" ? (
                        <FileJson2 size={17} />
                      ) : (
                        <FileText size={17} />
                      )}
                      <span>
                        {file.filename ??
                          file.kind ??
                          "Approved workspace file"}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="quiet">
                    Only Hindi reports and JSONL audits may be imported after
                    separate review.
                  </p>
                )}
              </article>
            </section>
          </>
        )}
      </section>
    </main>
  );
}

function SetupRequired() {
  return (
    <main className="setup">
      <div>
        <p className="eyebrow">FIREBASE MIGRATION PACKAGE</p>
        <h1>Configuration required before this private app can run.</h1>
        <p>
          Set only the public Firebase web configuration from `.env.example`.
          Never add owner email, Admin SDK credentials, reports, JSONL audits,
          drafts, contacts, or private documents to the browser build.
        </p>
        <code>
          VITE_FIREBASE_API_KEY · VITE_FIREBASE_AUTH_DOMAIN ·
          VITE_FIREBASE_PROJECT_ID · VITE_FIREBASE_APP_ID
        </code>
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);

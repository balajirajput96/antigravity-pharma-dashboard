# Firebase Hosting Web Configuration

The Hosting client requires only the Firebase web configuration values listed below. These are client configuration values, not Firebase Admin credentials. Obtain them from the Firebase Console after the project is configured, then provide them through the selected deployment environment; do not commit a `.env` file to this repository.

| Required key                | Purpose                                               |
| --------------------------- | ----------------------------------------------------- |
| `VITE_FIREBASE_API_KEY`     | Identifies the Firebase web application.              |
| `VITE_FIREBASE_AUTH_DOMAIN` | Enables Google Authentication redirects/popups.       |
| `VITE_FIREBASE_PROJECT_ID`  | Selects the Firebase project.                         |
| `VITE_FIREBASE_APP_ID`      | Identifies the Firebase web application registration. |
| `VITE_FIREBASE_REGION`      | Optional Functions region; defaults to `asia-south1`. |

Never place `OWNER_EMAIL`, Firebase Admin SDK credentials, billing values, reports, JSONL audits, drafts, contacts, or private documents in client configuration. The server-side `OWNER_EMAIL` secret must be set only through the Firebase Functions secret-management workflow after billing is active.

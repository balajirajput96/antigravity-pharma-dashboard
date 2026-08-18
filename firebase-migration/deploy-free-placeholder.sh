#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage: deploy-free-placeholder.sh --project FIREBASE_PROJECT_ID

Deploys only the static free-hosting/public placeholder. It never deploys
Functions, Firestore rules, Storage rules, secrets, or private data.
USAGE
}

if [[ "${1:-}" != "--project" || -z "${2:-}" || -n "${3:-}" ]]; then
  usage >&2
  exit 64
fi

project_id="$2"
if [[ ! "$project_id" =~ ^[a-z][a-z0-9-]{4,61}[a-z0-9]$ ]]; then
  echo "Invalid Firebase project identifier." >&2
  exit 64
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
config_file="$script_dir/firebase.json"
public_dir="$script_dir/free-hosting/public"

if [[ ! -f "$config_file" || ! -d "$public_dir" || ! -f "$public_dir/index.html" ]]; then
  echo "The free placeholder deployment files are incomplete." >&2
  exit 65
fi

node - "$config_file" <<'NODE'
const fs = require('node:fs');
const config = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
if (config?.hosting?.public !== 'free-hosting/public') {
  console.error('Firebase Hosting must target only free-hosting/public.');
  process.exit(65);
}
NODE

if grep -RInE '<script|apiKey|authDomain|appId|measurementId|initializeApp|firebaseConfig' "$public_dir"; then
  echo "The free placeholder contains a forbidden runtime integration marker." >&2
  exit 65
fi

firebase_bin="${FIREBASE_BIN:-firebase}"
firebase_args=()

if [[ "$firebase_bin" == *" "* ]]; then
  read -r -a firebase_parts <<< "$firebase_bin"
  firebase_bin="${firebase_parts[0]}"
  firebase_args=("${firebase_parts[@]:1}")
fi

if ! command -v "$firebase_bin" >/dev/null 2>&1; then
  echo "Firebase CLI is not available. Install it or set FIREBASE_BIN to an executable command." >&2
  exit 69
fi

echo "Deploying only the static no-data Hosting placeholder to project: $project_id"
"$firebase_bin" "${firebase_args[@]}" deploy --only hosting --project "$project_id" --non-interactive

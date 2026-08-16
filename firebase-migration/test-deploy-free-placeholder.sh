#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

fake_firebase="$tmp_dir/firebase"
args_file="$tmp_dir/firebase-args.txt"

cat > "$fake_firebase" <<'FAKE_FIREBASE'
#!/usr/bin/env bash
printf '%s\n' "$@" > "$FIREBASE_ARGS_FILE"
FAKE_FIREBASE
chmod 700 "$fake_firebase"

FIREBASE_ARGS_FILE="$args_file" FIREBASE_BIN="$fake_firebase" \
  "$script_dir/deploy-free-placeholder.sh" --project free-placeholder-test

expected=$'deploy\n--only\nhosting\n--project\nfree-placeholder-test\n--non-interactive'
actual="$(cat "$args_file")"
if [[ "$actual" != "$expected" ]]; then
  echo "Unexpected Firebase deployment arguments:" >&2
  printf '%s\n' "$actual" >&2
  exit 1
fi

echo "Free placeholder deployment helper validation passed."

#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
template_dir="$project_root/automation/gemini-workspace-template"
workspace="/home/ubuntu/agy_pharma_job_task"
launcher="/home/ubuntu/gemini_pharma"

mkdir -p "$workspace"
for file in GEMINI.md gemini_pharma_safety.toml package.json pnpm-workspace.yaml validate_safety_policy.sh; do
  install -m 600 "$template_dir/$file" "$workspace/$file"
done
install -m 700 "$template_dir/gemini_pharma" "$launcher"
chmod 700 "$workspace/validate_safety_policy.sh"

echo "Restored non-secret Gemini workspace files to $workspace."
echo "Install the local Gemini CLI and complete its account/API authentication separately; no credentials are stored by this script."

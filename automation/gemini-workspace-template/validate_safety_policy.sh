#!/usr/bin/env bash
set -euo pipefail

workspace="/home/ubuntu/agy_pharma_job_task"
instructions="$workspace/GEMINI.md"
policy="$workspace/gemini_pharma_safety.toml"

test -f "$instructions"
test -f "$policy"

for required in \
  "public" \
  "Hindi research report" \
  "JSONL audit" \
  "Truthful outreach drafts" \
  "Never send an email" \
  "Never submit a form" \
  "Never use, request, store, copy, or disclose passwords, OTPs, Aadhaar, PAN, bank details" \
  "no external action was taken" \
  "direct user confirmation is required"; do
  grep -Fqi "$required" "$instructions"
done

for required in \
  "email-send" \
  "form-submit" \
  "password-use" \
  "otp-use" \
  "captcha-bypass" \
  "private-data-collect" \
  "external-outreach"; do
  grep -Fq "$required" "$policy"
done

echo "Gemini research-only safety policy validated."


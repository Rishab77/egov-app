#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RESULTS_DIR="${K6_RESULTS_DIR:-$ROOT_DIR/results}"
mkdir -p "$RESULTS_DIR"
K6_BIN="${K6_BIN:-k6}"

cleanup() {
  "$ROOT_DIR/scripts/tc/reset.sh"
}
trap cleanup EXIT INT TERM

if [ "$#" -gt 0 ]; then
  PROFILES=("$@")
else
  PROFILES=(512 2000 10000)
fi

for profile in "${PROFILES[@]}"; do
  printf '\n=== Running benchmark profile %s ===\n' "$profile"
  "$ROOT_DIR/scripts/tc/apply-profile.sh" "$profile"

  for protocol in rest grpc graphql; do
    out_file="$RESULTS_DIR/${protocol}-${profile}.json"
    log_file="$RESULTS_DIR/${protocol}-${profile}.log"
    printf 'Running %s benchmark...\n' "$protocol"
    "$K6_BIN" run "$ROOT_DIR/scripts/k6/${protocol}.test.js" --summary-export "$out_file" > "$log_file"
  done

  "$ROOT_DIR/scripts/tc/reset.sh"
  printf '\n=== Completed benchmark profile %s ===\n' "$profile"
done

#!/usr/bin/env bash
set -euo pipefail

INTERFACE="${TC_INTERFACE:-$(ip route show default 2>/dev/null | awk '/default/ { print $5; exit }')}"
INTERFACE="${INTERFACE:-eth0}"

SUDO=""
if command -v sudo >/dev/null 2>&1 && [ "$(id -u)" -ne 0 ]; then
  SUDO="sudo"
fi

printf 'Resetting traffic-control rules on %s\n' "$INTERFACE"
$SUDO tc qdisc del dev "$INTERFACE" root 2>/dev/null || true

#!/usr/bin/env bash
set -euo pipefail

PROFILE="${1:-512}"
INTERFACE="${TC_INTERFACE:-$(ip route show default 2>/dev/null | awk '/default/ { print $5; exit }')}"
INTERFACE="${INTERFACE:-eth0}"

case "${PROFILE,,}" in
  512|512k|512kbit|512kbps)
    RATE="512kbit"
    ;;
  2|2000|2m|2mbit|2mbps)
    RATE="2mbit"
    ;;
  10|10000|10m|10mbit|10mbps)
    RATE="10mbit"
    ;;
  *)
    echo "Unsupported profile: ${PROFILE}. Use 512, 2000, or 10000." >&2
    exit 1
    ;;
esac

if ! command -v tc >/dev/null 2>&1; then
  echo "tc is required to apply network profiles. Install iproute2 first." >&2
  exit 1
fi

SUDO=()
if [ "$(id -u)" -ne 0 ]; then
  if ! command -v sudo >/dev/null 2>&1; then
    echo "Root privileges are required to apply traffic-control profiles." >&2
    exit 1
  fi
  SUDO=(sudo)
fi

printf 'Applying %s with 50ms egress delay on %s\n' "$RATE" "$INTERFACE"
if ! "${SUDO[@]}" tc qdisc replace dev "$INTERFACE" root netem delay 50ms rate "$RATE"; then
  echo "Could not apply netem. This kernel may not include CONFIG_NET_SCH_NETEM." >&2
  exit 1
fi
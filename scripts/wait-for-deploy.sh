#!/usr/bin/env bash
# Waits for the newest Vercel deployment of this project to finish and prints
# its status. Used by the wave wrap-up routine (PLAN.md). Needs the Vercel CLI
# logged in and this folder linked (`vercel link`).
set -u
for _ in $(seq 1 60); do
  row=$(perl -e 'alarm 30; exec @ARGV' vercel ls peak < /dev/null 2>&1 | grep -m1 -E "https://peak-")
  case "$row" in
    *"● Ready"*) echo "READY: $row"; exit 0 ;;
    *"● Error"*|*"● Canceled"*) echo "FAILED: $row"; exit 1 ;;
  esac
  sleep 10
done
echo "TIMEOUT waiting for deploy"; exit 2

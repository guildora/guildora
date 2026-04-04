#!/bin/bash
# Auto-restart production preview server (for Cloudflare Tunnel)
# Usage: nohup bash scripts/preview-server-watch.sh &

export COREPACK_HOME="$HOME/.corepack"
DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$DIR"

echo "[preview-watch] Building all apps..."
pnpm build 2>&1
BUILD_EXIT=$?

if [ $BUILD_EXIT -ne 0 ]; then
  echo "[preview-watch] Build failed with code $BUILD_EXIT"
  exit 1
fi

echo "[preview-watch] Build done. Starting preview servers..."

while true; do
  echo "[preview-watch] Starting at $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  pnpm --parallel --recursive run start 2>&1
  EXIT_CODE=$?
  echo "[preview-watch] Exited with code $EXIT_CODE at $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "[preview-watch] Restarting in 5 seconds..."
  sleep 5
done

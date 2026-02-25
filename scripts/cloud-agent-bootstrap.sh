#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_DIR="${ROOT_DIR}/web"

require_cmd() {
  local cmd="$1"
  if ! command -v "${cmd}" >/dev/null 2>&1; then
    echo "[env] missing command: ${cmd}"
    exit 1
  fi
}

require_cmd node
require_cmd npm

NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if [ "${NODE_MAJOR}" -lt 22 ]; then
  echo "[env] Node.js 22+ required, current: $(node -v)"
  exit 1
fi

mkdir -p "${HOME}/.npm"
npm config set cache "${HOME}/.npm" --global >/dev/null

if command -v docker >/dev/null 2>&1; then
  echo "[env] $(docker --version)"
  if docker compose version >/dev/null 2>&1; then
    echo "[env] $(docker compose version)"
  else
    echo "[env] docker compose plugin not found"
    exit 1
  fi
else
  echo "[env] docker not found"
  exit 1
fi

if [ ! -d "${WEB_DIR}" ]; then
  echo "[env] missing directory: ${WEB_DIR}"
  exit 1
fi

cd "${WEB_DIR}"
npm ci
npm run prisma:generate

echo "[env] cloud bootstrap completed"


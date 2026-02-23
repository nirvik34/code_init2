#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
echo "=== SAMAAN: Preparing environment in $ROOT_DIR ==="

echo "-- Backend: creating venv and installing Python deps"
cd "$ROOT_DIR/backend"
python -m venv .venv || true
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

echo "-- Frontend: installing npm deps"
cd "$ROOT_DIR/frontend"
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

echo "=== Setup complete. To run services: ==="
echo "Backend: cd backend && source .venv/bin/activate && uvicorn app.main:app --reload"
echo "Frontend: cd frontend && NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev"

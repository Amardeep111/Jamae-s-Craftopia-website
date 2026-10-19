#!/bin/bash
# Craftopia Full Setup + Restart Script
# Works with: local PostgreSQL (podman/docker-compose) OR Supabase (plug-and-play)
# Usage: ./setup-and-restart.sh [supabase]
# Example with Supabase: ./setup-and-restart.sh supabase

set -euo pipefail

MODE="${1:-local}"  # "local" or "supabase"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "========================================"
echo "Craftopia Setup / Restart Script"
echo "Mode: $MODE"
echo "Project: $PROJECT_DIR"
echo "========================================"

# ── 1. Kill existing processes ───────────────────────────────────────────
echo "[1/8] Stopping existing servers..."
kill $(lsof -ti:3000) 2>/dev/null || true
kill $(lsof -ti:5432) 2>/dev/null || true
sleep 1

# ── 2. Database setup (plug-and-play for Supabase) ────────────────────────
if [ "$MODE" = "supabase" ]; then
  echo "[2/8] Supabase mode — using remote DB (no local postgres needed)"
  # User plugs in Supabase URL via env; this reads from .env
  if ! grep -q "DATABASE_URL" "$PROJECT_DIR/.env" 2>/dev/null && ! grep -q "DATABASE_URL" "$PROJECT_DIR/.env.local" 2>/dev/null; then
    echo "WARNING: No DATABASE_URL found. Add to .env.local:"
    echo 'DATABASE_URL="postgresql://postgres:[PW]@db.[REF].supabase.co:5432/postgres"'
    echo "(Get connection string from Supabase Project Settings > Database > Connection string > URI)"
  fi
else
  echo "[2/8] Starting local PostgreSQL (podman-compose)..."
  cd "$PROJECT_DIR"
  podman-compose up -d 2>/dev/null || docker-compose up -d 2>/dev/null || echo "No container runtime; ensuring .env has DB config"
fi

# ── 3. Env setup (plug-and-play) ──────────────────────────────────────────
echo "[3/8] Env / config check..."
if [ ! -f "$PROJECT_DIR/.env.local" ] && [ ! -f "$PROJECT_DIR/.env" ]; then
  cp "$PROJECT_DIR/.env.example" "$PROJECT_DIR/.env.local" 2>/dev/null || true
  echo "Created .env.local from .env.example — edit DATABASE_URL / NEXT_PUBLIC_MAPBOX_TOKEN"
fi

# If Supabase, guide them to replace DATABASE_URL
if [ "$MODE" = "supabase" ]; then
  echo "  -> Remember to set DATABASE_URL to your Supabase URI in .env.local"
fi

# ── 4. Prisma generate ────────────────────────────────────────────────────
echo "[4/8] Generating Prisma client..."
cd "$PROJECT_DIR"
npx prisma generate 2>/dev/null || npm run postinstall 2>/dev/null || echo "Try running: npx prisma generate manually"

# ── 5. DB push / migrate ─────────────────────────────────────────────────
echo "[5/8] Applying DB schema..."
if [ "$MODE" = "supabase" ]; then
  echo "  -> Using Supabase remote DB — pushing schema (if URL configured)"
  npx prisma db push --accept-data-loss 2>/dev/null || echo "DB push skipped (check DATABASE_URL)"
else
  echo "  -> Pushing to local Postgres"
  npx prisma db push --accept-data-loss 2>/dev/null || echo "DB push skipped (check local postgres is running)"
fi

# ── 6. Seed (optional) ────────────────────────────────────────────────────
echo "[6/8] Seeding data..."
node prisma/seed.js 2>/dev/null || echo "Seed skipped (optional)"

# ── 7. Restart UI (Next.js dev server) ────────────────────────────────────
echo "[7/8] Starting UI server on :3000..."
nohup npm run dev > "$PROJECT_DIR/dev-server.log" 2>&1 &
sleep 3
if curl -sf http://localhost:3000 >/dev/null 2>&1; then
  echo "  -> UI server running at http://localhost:3000"
else
  echo "  -> UI server starting (check $PROJECT_DIR/dev-server.log)"
fi

# ── 8. Done ──────────────────────────────────────────────────────────────
echo "========================================"
echo "Setup complete!"
echo "  Mode: $MODE"
echo "  UI:   http://localhost:3000"
echo "  DB:   $MODE"
echo "========================================"
echo ""
echo "Next steps:"
if [ "$MODE" = "supabase" ]; then
  echo "  1. Add DATABASE_URL (from Supabase Settings > Database) to .env.local"
  echo "  2. Re-run this script or do: npx prisma db push"
else
  echo "  1. Confirm .env.local has NEXT_PUBLIC_MAPBOX_TOKEN (optional)"
  echo "  2. Check $PROJECT_DIR/dev-server.log if server didn't start"
fi
echo ""
echo "To restart again: $0 [local|supabase]"

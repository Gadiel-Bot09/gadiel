#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_WS="apps/backend"
FRONTEND_WS="apps/frontend"
BACKEND_DIR="$ROOT_DIR/$BACKEND_WS"
ENV_FILE="$ROOT_DIR/.env"
ENV_EXAMPLE="$ROOT_DIR/.env.example"

print_step() {
  printf '\n\033[1;34m[DEV PREVIEW]\033[0m %s\n' "$1"
}

cleanup() {
  local exit_code=$?
  trap - EXIT INT TERM
  if [[ -n "${BACKEND_PID:-}" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
  if [[ -n "${FRONTEND_PID:-}" ]] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
  wait 2>/dev/null || true
  exit "$exit_code"
}

trap cleanup EXIT INT TERM

print_step "Verificando archivo .env"
if [[ ! -f "$ENV_FILE" ]]; then
  print_step "No se encontró .env, duplicando desde .env.example"
  cp "$ENV_EXAMPLE" "$ENV_FILE"
fi

print_step "Instalando dependencias del backend"
npm install --workspace "$BACKEND_WS"

print_step "Instalando dependencias del frontend"
npm install --workspace "$FRONTEND_WS"

print_step "Generando cliente Prisma"
npm run prisma:generate --workspace "$BACKEND_WS"

if [[ -d "$BACKEND_DIR/prisma/migrations" ]] && [[ -n "$(ls -A "$BACKEND_DIR/prisma/migrations" 2>/dev/null)" ]]; then
  print_step "Aplicando migraciones Prisma"
  npm exec --workspace "$BACKEND_WS" prisma migrate deploy
else
  print_step "Sin migraciones persistidas, sincronizando esquema (db push)"
  npm exec --workspace "$BACKEND_WS" prisma db push
fi

print_step "Ejecutando seed de datos demo"
npm run prisma:seed --workspace "$BACKEND_WS"

print_step "Iniciando API NestJS (puerto 3000)"
npm run start:dev --workspace "$BACKEND_WS" &
BACKEND_PID=$!

print_step "Iniciando frontend React (puerto 5173)"
npm run dev --workspace "$FRONTEND_WS" &
FRONTEND_PID=$!

print_step "Servidores en ejecución. API: http://localhost:3000/api | Frontend: http://localhost:5173"
print_step "Presiona Ctrl+C para detener"

wait

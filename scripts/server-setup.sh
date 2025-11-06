#!/usr/bin/env bash
set -euo pipefail

if [[ "${DEBUG:-}" == "1" ]]; then
  set -x
fi

if [[ "$(id -u)" -ne 0 ]]; then
  echo "[ERROR] Debes ejecutar este script con privilegios de administrador (sudo)." >&2
  exit 1
fi

REPO_URL=${REPO_URL:-"https://github.com/REEMPLAZA_USUARIO/gadiel-pos.git"}
APP_DIR=${APP_DIR:-"/opt/gadiel-pos"}
BRANCH=${BRANCH:-"main"}
ENV_FILE=${ENV_FILE:-".env"}

log() {
  echo "[server-setup] $1"
}

install_dependencies() {
  log "Actualizando índices de paquetes"
  apt-get update -y

  log "Instalando dependencias base (curl, git, ca-certificates)"
  apt-get install -y curl git ca-certificates apt-transport-https lsb-release gnupg

  if ! command -v docker >/dev/null 2>&1; then
    log "Instalando Docker Engine"
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo \"deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable\" \
      > /etc/apt/sources.list.d/docker.list
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    systemctl enable docker
    systemctl start docker
  else
    log "Docker ya instalado, omitiendo"
  fi
}

clone_repository() {
  if [[ -d "$APP_DIR/.git" ]]; then
    log "Repositorio ya existe en $APP_DIR, realizando git pull"
    git -C "$APP_DIR" fetch --all
    git -C "$APP_DIR" checkout "$BRANCH"
    git -C "$APP_DIR" pull origin "$BRANCH"
  else
    log "Clonando repositorio $REPO_URL en $APP_DIR"
    mkdir -p "$APP_DIR"
    git clone "$REPO_URL" "$APP_DIR"
    git -C "$APP_DIR" checkout "$BRANCH"
  fi
}

prepare_env() {
  if [[ ! -f "$APP_DIR/$ENV_FILE" ]]; then
    log "Generando archivo de entorno desde .env.example"
    cp "$APP_DIR/.env.example" "$APP_DIR/$ENV_FILE"
    log "Recuerda editar $APP_DIR/$ENV_FILE con credenciales reales antes de continuar."
  else
    log "$ENV_FILE ya existe, omitiendo copia"
  fi
}

configure_domains() {
  FRONTEND_DOMAIN=${FRONTEND_DOMAIN:-}
  BACKEND_DOMAIN=${BACKEND_DOMAIN:-}
  CADDY_EMAIL=${CADDY_EMAIL:-}

  if [[ -z "$FRONTEND_DOMAIN" ]]; then
    read -rp "Dominio para el frontend (ej. pos.midominio.com): " FRONTEND_DOMAIN
  fi

  if [[ -z "$BACKEND_DOMAIN" ]]; then
    read -rp "Dominio para la API/backend (ej. api.midominio.com): " BACKEND_DOMAIN
  fi

  if [[ -z "$CADDY_EMAIL" ]]; then
    read -rp "Correo de contacto para certificados SSL (Let's Encrypt): " CADDY_EMAIL
    if [[ -z "$CADDY_EMAIL" ]]; then
      CADDY_EMAIL="admin@${FRONTEND_DOMAIN#*.}"
      log "No se proporcionó correo, usando $CADDY_EMAIL"
    fi
  fi

  if [[ -z "$FRONTEND_DOMAIN" || -z "$BACKEND_DOMAIN" ]]; then
    echo "[ERROR] Debes especificar dominios válidos para frontend y backend." >&2
    exit 1
  fi

  local caddy_file="$APP_DIR/deploy/Caddyfile"
  mkdir -p "$(dirname "$caddy_file")"

  log "Generando configuración de Caddy con certificados HTTPS para $FRONTEND_DOMAIN y $BACKEND_DOMAIN"

  local tls_notice="  # Caddy gestionará automáticamente los certificados Let's Encrypt"

  if [[ "$FRONTEND_DOMAIN" == "$BACKEND_DOMAIN" ]]; then
    cat >"$caddy_file" <<EOF
{
  email $CADDY_EMAIL
  acme_ca https://acme-v02.api.letsencrypt.org/directory
}

http://$FRONTEND_DOMAIN {
  redir https://$FRONTEND_DOMAIN{uri}
}

$FRONTEND_DOMAIN {
$tls_notice
  encode gzip

  @api path /api/*
  handle @api {
    reverse_proxy backend:3000
  }

  handle {
    reverse_proxy frontend:4173
  }
}
EOF
  else
    cat >"$caddy_file" <<EOF
{
  email $CADDY_EMAIL
  acme_ca https://acme-v02.api.letsencrypt.org/directory
}

http://$FRONTEND_DOMAIN {
  redir https://$FRONTEND_DOMAIN{uri}
}

$FRONTEND_DOMAIN {
$tls_notice
  encode gzip
  reverse_proxy frontend:4173
}

http://$BACKEND_DOMAIN {
  redir https://$BACKEND_DOMAIN{uri}
}

$BACKEND_DOMAIN {
$tls_notice
  reverse_proxy backend:3000
}
EOF
  fi

  log "Archivo Caddyfile actualizado en $caddy_file. Asegúrate de apuntar los registros DNS A/AAAA al servidor antes de iniciar."
}

update_env_urls() {
  local env_path="$APP_DIR/$ENV_FILE"

  if [[ ! -f "$env_path" ]]; then
    log "No se encontró $env_path; omitiendo actualización de variables."
    return
  fi

  if [[ -n "${BACKEND_DOMAIN:-}" ]]; then
    log "Actualizando VITE_API_URL en $env_path para https://$BACKEND_DOMAIN/api"
    if grep -q '^VITE_API_URL=' "$env_path"; then
      sed -i "s|^VITE_API_URL=.*|VITE_API_URL=https://$BACKEND_DOMAIN/api|" "$env_path"
    else
      echo "VITE_API_URL=https://$BACKEND_DOMAIN/api" >>"$env_path"
    fi
  fi
}

launch_stack() {
  log "Construyendo imágenes y levantando servicios con Docker Compose"
  (cd "$APP_DIR" && docker compose up -d --build)
  log "Servicios desplegados. Backend: https://$BACKEND_DOMAIN | Frontend: https://$FRONTEND_DOMAIN"
}

install_dependencies
clone_repository
prepare_env
configure_domains
update_env_urls
launch_stack

log "Instalación automatizada completada."

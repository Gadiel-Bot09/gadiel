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

launch_stack() {
  log "Construyendo imágenes y levantando servicios con Docker Compose"
  (cd "$APP_DIR" && docker compose up -d --build)
  log "Servicios desplegados. Backend: http://localhost:3000 | Frontend: http://localhost:5173"
}

install_dependencies
clone_repository
prepare_env
launch_stack

log "Instalación automatizada completada."

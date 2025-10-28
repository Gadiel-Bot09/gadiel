# Gadiel POS Platform

Plataforma POS web multi-empresa para retail y restaurantes, localizada para Colombia (ES-CO, COP). Incluye front-end con React + Tailwind + shadcn/ui y back-end NestJS + PostgreSQL + Prisma, autenticación JWT/refresh, licenciamiento por empresa y módulos base de inventario y ventas.

## Características principales

- **Multi-tenant** (aislamiento por empresa vía `X-Company-Id`).
- **Licenciamiento obligatorio** con validación continua, revocación y gracia offline de 72 h.
- **UI moderna** con tema claro/oscuro, colores primario azul y acento verde, tablas con filtros, skeletons y animaciones.
- **Módulos iniciales**: Dashboard, Productos, Configuración de Licencia. Estructura preparada para Ventas, Clientes, Proveedores, Reportes y Gastos.
- **Formateo COP** (`$1.250.500,00 COP`), zona horaria America/Bogota.
- **Seguridad**: JWT + refresh tokens, guardias de licencia, RBAC (roles/permisos base), auditoría.
- **Calidad**: ESLint + Prettier, Vitest (unit), Playwright (e2e con mocks).
- **Infraestructura**: Docker Compose (PostgreSQL, API, Web, Caddy), Prisma migrations/seed, CI base (scripts).

## Estructura de carpetas

```
apps/
  backend/        API NestJS + Prisma
  frontend/       React + Vite + Tailwind + shadcn/ui
deploy/           Configuración Caddy
```

## Requisitos

- Node.js ≥ 20
- npm ≥ 9
- Docker + Docker Compose (para despliegue contenedorizado)
- PostgreSQL (local o contenedor)

## Variables de entorno

Duplicar `.env.example` → `.env` y ajustar:

```bash
# Base de datos
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gadiel

# Autenticación
JWT_SECRET=supersecretjwt
JWT_REFRESH_SECRET=superrefreshsecret
LICENSE_JWT_SECRET=superlicensesecret
ACCESS_TOKEN_TTL=900
REFRESH_TOKEN_TTL=604800

# Backend
PORT=3000
TIMEZONE=America/Bogota
CURRENCY=COP

# Frontend
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Gadiel POS
```

## Publicación en GitHub y despliegue automatizado

### 1. Crear un repositorio en GitHub

1. Inicia sesión en GitHub y crea un repositorio vacío (por ejemplo `gadiel-pos`).
2. En tu máquina local clona este proyecto y añade el remoto:

   ```bash
   git init
   git remote add origin git@github.com:TU_USUARIO/gadiel-pos.git
   git add .
   git commit -m "chore: bootstrap gadiel pos"
   git push -u origin main
   ```

   > También puedes usar GitHub CLI: `gh repo create TU_USUARIO/gadiel-pos --private --source=. --push`.

### 2. Instalación automática en un servidor Ubuntu 22.04+

1. Conéctate vía SSH al servidor (idealmente como un usuario con permisos `sudo`).
2. Ejecuta el script de instalación automática que prepara Docker, clona el repositorio y levanta los contenedores:

   ```bash
   sudo REPO_URL=https://github.com/TU_USUARIO/gadiel-pos.git \
     APP_DIR=/opt/gadiel-pos \
     BRANCH=main \
     bash scripts/server-setup.sh
   ```

   - `REPO_URL`: apunta al repositorio que acabas de crear.
   - `APP_DIR`: ruta donde se clonará el proyecto en el servidor.
   - `BRANCH`: rama a desplegar.

3. El script instalará Docker Engine si no existe, clonará la última versión del repositorio, generará `.env` (copiado desde `.env.example`) y ejecutará `docker compose up -d --build`.
4. Edita el archivo `.env` generado en `APP_DIR` con las credenciales reales (DB, JWT, etc.) y vuelve a ejecutar `docker compose up -d` si cambias los valores.

Servicios publicados por defecto:

- Backend REST: `http://TU_SERVIDOR:3000`
- Frontend: `http://TU_SERVIDOR:5173`
- Caddy (si configuras TLS y dominios en `deploy/Caddyfile`).

### 3. Actualizar versiones desplegadas

Cuando hagas cambios en `main`:

```bash
ssh usuario@tu-servidor
cd /opt/gadiel-pos
sudo git pull origin main
sudo docker compose up -d --build
```

## Instalación local

```bash
# Instalar dependencias
npm install --workspace apps/backend
npm install --workspace apps/frontend

# Generar cliente Prisma y aplicar migraciones
npm run prisma:generate --workspace apps/backend
npm run prisma:migrate --workspace apps/backend
npm run prisma:seed --workspace apps/backend

# Ejecutar API y Frontend en paralelo
npm run start:dev --workspace apps/backend
npm run dev --workspace apps/frontend
```

La API expone `http://localhost:3000/api` y el front `http://localhost:5173`.

## Previsualización automática (script)

Para automatizar todo el flujo de instalación y levantar ambos servicios de desarrollo en una sola instrucción, usa el script
`scripts/dev-preview.sh`:

```bash
bash scripts/dev-preview.sh
```

El script realiza las siguientes tareas:

1. Copia `.env.example` → `.env` si no existe.
2. Instala dependencias del backend y frontend.
3. Genera el cliente Prisma.
4. Aplica migraciones existentes (`prisma migrate deploy`) o sincroniza el esquema con `prisma db push` cuando no hay migraciones.
5. Ejecuta el seed de datos demo.
6. Arranca la API NestJS en `http://localhost:3000/api` y el frontend en `http://localhost:5173` (ambos procesos se cierran con `Ctrl+C`).

Ideal para una previsualización rápida del sistema POS sin ejecutar manualmente cada paso.

## Pruebas y lint

```bash
# Lint
npm run lint --workspace apps/backend
npm run lint --workspace apps/frontend

# Unit tests
npm run test --workspace apps/backend
npm run test --workspace apps/frontend

# Playwright (requiere front en ejecución)
npm run test:e2e --workspace apps/frontend
```

## Docker Compose

```bash
docker compose up --build
```

Servicios expuestos:

- `backend`: http://localhost:3000 (REST + WebSockets futuros)
- `frontend`: http://localhost:5173 (o vía Caddy https://localhost)
- `postgres`: puerto 5432

Ajustar `deploy/Caddyfile` y variables DNS para TLS real (ej. Cloudflare token `CLOUDFLARE_API_TOKEN`).

## Licenciamiento

1. **Generar token** (panel master externo) firmando payload JWT (`company_id`, `plan`, `start_date`, `end_date`, `features`, `seats`, `max_branches`, `nonce`).
2. **Activar** en Configuración → Licencia, pegando el token.
3. **Validación** en cada request (middleware `LicenseGuard`):
   - Bloquea mutaciones si la licencia expira, es inválida o revocada.
   - Permite 72 h offline con última validación exitosa.
   - Muestra banner de estado (activo, por vencer, vencido, inválido).
4. **Revocación** (tabla `license_tokens` + `license_events`).

## Auditoría y RBAC

- `audit_logs`: registra cambios en entidades críticas (ej. productos) con `before/after`, usuario e IP.
- Roles/Permisos básicos en Prisma listos para extender (ver `schema.prisma`).

## Scripts útiles

- Importar CSV (pendiente de implementación) → `apps/backend/src/modules/products` base.
- Etiquetas QR/Barras y exportaciones PDF/CSV preparados en estructura (añadir implementaciones específicas).

## Roadmap próximo

- Completar módulos Ventas, Clientes, Proveedores, Gastos con flujos completos.
- Integrar WebSockets para arqueos en tiempo real.
- Implementar servicios SMTP/WhatsApp y hardware (lectores/impresoras).
- Automatizar pipelines CI (GitHub Actions) ejecutando lint + tests + playwright headless.

## Licencia

Proyecto interno Gadiel POS © 2024.

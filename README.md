# 🛡️ euVWA — Pipeline DevSecOps (Actividad 2)

> **Desarrollo Seguro de Aplicaciones · Universidad Europea**  
> Pipeline CI/CD completo con controles de seguridad automatizados: SAST, DAST, SBOM, escaneo de imagen Docker.

---

## Índice

1. [Descripción del proyecto](#1-descripción-del-proyecto)
2. [Estructura del repositorio](#2-estructura-del-repositorio)
3. [Pipeline CI/CD — Arquitectura](#3-pipeline-cicd--arquitectura)
4. [Explicación detallada de cada paso](#4-explicación-detallada-de-cada-paso)
5. [Dockerfile seguro — Hardening aplicado](#5-dockerfile-seguro--hardening-aplicado)
6. [Vulnerabilidades detectadas](#6-vulnerabilidades-detectadas)
7. [Ramas y comportamiento esperado](#7-ramas-y-comportamiento-esperado)
8. [Cómo ejecutar localmente](#8-cómo-ejecutar-localmente)

---

## 1. Descripción del proyecto

**euVWA** (Universidad Europea — Vulnerable Web App) es una aplicación Node.js/Express diseñada como laboratorio de seguridad. Contiene vulnerabilidades intencionadas de las categorías OWASP Top 10:

| # | Vulnerabilidad | Ruta |
|---|---------------|------|
| 1 | Reflected XSS | `/xss/reflected` |
| 2 | Stored XSS | `/xss/stored` |
| 3 | Command Injection | `/cmd` |
| 4 | Path Traversal | `/file` |
| 5 | SQL Injection | `/sql` |
| 6 | Broken Access Control | `/admin` |
| 7 | Sensitive Data Exposure | `/api/users` |
| 8 | Security Misconfiguration | `/error` |

Esta actividad implementa un **pipeline DevSecOps completo** que detecta estas vulnerabilidades de forma automatizada, siguiendo el principio de **Shift Left Security**: integrar la seguridad desde las primeras fases del desarrollo.

---

## 2. Estructura del repositorio

```
euVWA/
├── .github/
│   └── workflows/
│       ├── pipeline-vulnerable.yml   # Pipeline rama main-vulnerable (falla)
│       └── pipeline-secure.yml       # Pipeline rama main-secure (pasa)
├── .zap/
│   └── rules.tsv                     # Reglas personalizadas para ZAP
├── controllers/                       # Lógica de negocio
│   ├── xssController.js
│   ├── commandController.js
│   ├── fileController.js
│   ├── sqlController.js
│   ├── accessController.js
│   ├── apiController.js
│   └── configController.js
├── routes/                            # Definición de rutas Express
├── public/                            # Assets estáticos
├── files/                             # Archivos del laboratorio
├── app.js                             # Punto de entrada
├── package.json
├── Dockerfile                         # Imagen multi-stage segura
└── README.md
```

---

## 3. Pipeline CI/CD — Arquitectura

El pipeline implementa un **flujo de seguridad en cascada** con 6 etapas:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    SAST     │───▶│    BUILD    │───▶│    SBOM     │
│  (Semgrep)  │    │  (Docker)   │    │   (Syft)    │
└─────────────┘    └──────┬──────┘    └─────────────┘
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
        ┌──────────┐ ┌─────────┐ ┌──────────┐
        │  Trivy   │ │  DAST   │ │  Grype   │
        │ (imagen) │ │  (ZAP)  │ │  (deps)  │
        └──────────┘ └─────────┘ └──────────┘
              │           │           │
              └───────────┼───────────┘
                          ▼
                   ┌─────────────┐
                   │   SUMMARY   │
                   │  (Informe)  │
                   └─────────────┘
```

**Herramientas utilizadas:**

| Herramienta | Categoría | Propósito |
|-------------|-----------|-----------|
| **Semgrep** | SAST | Análisis estático de código fuente |
| **Docker Buildx** | Build | Construcción de imagen multi-stage |
| **Syft** | SBOM | Inventario de componentes software |
| **Trivy** | SCA + Image Scan | Vulnerabilidades en imagen y dependencias |
| **Grype** | SCA | Análisis de vulnerabilidades sobre SBOM |
| **OWASP ZAP** | DAST | Pruebas dinámicas contra la app en ejecución |

---

## 4. Explicación detallada de cada paso

### 4.1 SAST — Análisis Estático (Semgrep)

**¿Qué es?** El análisis estático examina el código fuente sin ejecutarlo, buscando patrones de código inseguro.

**¿Por qué?** Detecta vulnerabilidades en fase de desarrollo, antes de compilar o desplegar. Es el control más barato de implementar (coste cero en tiempo de ejecución).

**Configuración usada:**
- `p/nodejs` — Reglas específicas para Node.js
- `p/javascript` — Patrones inseguros en JS genérico
- `p/owasp-top-ten` — Mapeo directo a OWASP Top 10
- `p/injection` — Detección de inyecciones (SQL, comandos, LDAP)

**Hallazgos esperados en rama vulnerable:**
- `commandController.js`: `exec("ping -c 2 " + host)` → **Command Injection** (CWE-78)
- `sqlController.js`: concatenación de query → **SQL Injection** (CWE-89)
- `xssController.js`: interpolación directa de `req.query.name` → **XSS** (CWE-79)
- `fileController.js`: `"files/" + file` sin sanitizar → **Path Traversal** (CWE-22)

**Propósito de seguridad:** Implementar "security as code" — las reglas de seguridad viajan con el código y se aplican en cada commit.

---

### 4.2 Build Docker (multi-stage)

**¿Qué es?** Construcción de la imagen Docker siguiendo las mejores prácticas de hardening.

**¿Por qué?** Una imagen mal construida puede añadir superficie de ataque innecesaria: herramientas de compilación, usuarios con privilegios, secretos embebidos.

**Mejoras aplicadas (ver sección 5 para detalle completo):**
- Imagen base `node:20-alpine` (mínima, sin shell completo)
- Build multi-stage (sin devDependencies en producción)
- Usuario no-root (`appuser`)
- Sin secretos en la imagen
- Healthcheck definido

---

### 4.3 Generación de SBOM (Syft)

**¿Qué es?** El Software Bill of Materials es un inventario completo de todos los componentes de la imagen: librerías, versiones, licencias.

**¿Por qué?** Permite saber exactamente qué software contiene la imagen. Ante un nuevo CVE (ej: Log4Shell), se puede consultar el SBOM para saber inmediatamente si el software está afectado sin necesidad de re-analizar la imagen.

**Formatos generados:**
- **CycloneDX JSON** — Estándar OWASP, compatible con herramientas de análisis
- **SPDX JSON** — Estándar Linux Foundation/SPDX, compatible con compliance legal

**Ejemplo de entrada en SBOM (CycloneDX):**
```json
{
  "type": "library",
  "name": "express",
  "version": "5.2.1",
  "purl": "pkg:npm/express@5.2.1",
  "licenses": [{ "license": { "id": "MIT" } }]
}
```

---

### 4.4 Trivy — Escaneo de imagen Docker

**¿Qué es?** Trivy analiza la imagen Docker completa buscando CVEs conocidos en el sistema operativo base, librerías del sistema y dependencias de la aplicación.

**¿Por qué?** La imagen puede heredar vulnerabilidades de la imagen base o de dependencias transitivas que el desarrollador no instala directamente.

**Configuración:**
```yaml
severity: "CRITICAL,HIGH"
exit-code: "1"        # Falla el pipeline si hay hallazgos
ignore-unfixed: true  # Solo reporta CVEs con parche disponible
```

**Umbral de severidad:** Se bloqueará el pipeline ante cualquier CVE de severidad CRITICAL o HIGH que tenga fix disponible. CVEs MEDIUM y LOW generan advertencia pero no bloquean.

**Comportamiento por rama:**
- `main-vulnerable`: ❌ Falla por CVEs en dependencias vulnerables
- `main-secure`: ✅ Pasa porque las dependencias están actualizadas

---

### 4.5 DAST — OWASP ZAP Baseline Scan

**¿Qué es?** El análisis dinámico lanza la aplicación real y ejecuta ataques controlados contra ella para detectar vulnerabilidades que solo son visibles en tiempo de ejecución.

**¿Por qué?** El SAST analiza el código pero no puede ver cómo se comporta la app con entradas reales. El DAST complementa al SAST probando la superficie HTTP real: cabeceras, formularios, redirecciones.

**Modo Baseline:** Escaneo pasivo + activo ligero. No intenta explotación destructiva. Ideal para CI/CD por su velocidad (~2-5 minutos).

**Tipos de hallazgos esperados en rama vulnerable:**
- Cabecera `X-Content-Type-Options` ausente
- Cabecera `Content-Security-Policy` ausente
- Posible XSS en parámetros GET (`/xss/reflected?name=...`)
- Información sensible en respuestas (`/api/users`)

**Archivo de reglas `.zap/rules.tsv`:** Permite ignorar o rebajar alertas conocidas (falsos positivos del entorno de lab, como ausencia de HTTPS).

---

### 4.6 Grype — Escaneo de dependencias sobre SBOM

**¿Qué es?** Grype analiza el SBOM generado por Syft para detectar vulnerabilidades en las dependencias npm listadas.

**¿Por qué?** Complementa a Trivy: mientras Trivy escanea la imagen completa (OS + app), Grype se especializa en el árbol de dependencias de la aplicación. Usar dos herramientas reduce falsos negativos.

---

## 5. Dockerfile seguro — Hardening aplicado

```dockerfile
# STAGE 1: builder (no llega a producción)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev   # Sin devDependencies

# STAGE 2: runtime (imagen final)
FROM node:20-alpine AS runtime
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN chown -R appuser:appgroup /app && chmod -R 550 /app
USER appuser              # ← NO ROOT
EXPOSE 3000
HEALTHCHECK ...
CMD ["node", "app.js"]
```

**Justificación de cada medida:**

| Medida | Justificación |
|--------|--------------|
| `node:20-alpine` | Alpine Linux tiene ~5MB base vs ~900MB debian. Menor superficie de ataque. Sin bash, curl, ni herramientas de sistema innecesarias. |
| **Multi-stage build** | El stage `builder` contiene npm, compiladores y devDependencies que NO deben llegar a producción. El stage final solo tiene lo imprescindible para ejecutar. |
| **`npm ci --omit=dev`** | Instala exactamente lo del `package-lock.json` (reproducible) y omite devDependencies. Versiones fijas = CVEs predecibles. |
| **Usuario no-root** | Si un atacante consigue RCE, el proceso corre con privilegios mínimos. No puede leer `/etc/shadow`, instalar paquetes ni modificar archivos del sistema. |
| **`chmod 550`** | El usuario de la app puede leer y ejecutar pero no escribir. Mitigación de ataques de webshell (no puede escribir archivos nuevos). |
| **Sin secrets en imagen** | No hay `.env`, claves API ni contraseñas en los `COPY`. Los secrets se inyectan en runtime via variables de entorno o secrets de Kubernetes/Docker. |
| **HEALTHCHECK** | Permite a los orquestadores (Kubernetes, Docker Swarm) detectar y reiniciar contenedores colgados automáticamente. |
| **LABEL OCI** | Trazabilidad: cualquier imagen en producción puede relacionarse con su commit de origen. |

---

## 6. Vulnerabilidades detectadas

### Rama `main-vulnerable` — Hallazgos principales

#### 6.1 Command Injection — `commandController.js`

```javascript
// VULNERABLE
exec("ping -c 2 " + host, (err, stdout) => { ... });

// Explotación: host = "8.8.8.8; cat /etc/passwd"
// Resultado: ejecuta ping Y vuelca el fichero de contraseñas
```

**Severidad:** CRÍTICA (CVSS 9.8) | **CWE-78**  
**Corrección:** Validar que `host` sea una IP/hostname válida con regex, o usar `execFile` con array de argumentos.

#### 6.2 SQL Injection — `sqlController.js`

```javascript
// VULNERABLE
const query = "SELECT * FROM users WHERE username = '" + username +
              "' AND password = '" + password + "'";

// Explotación: username = "' OR '1'='1" → bypass de login
```

**Severidad:** CRÍTICA (CVSS 9.8) | **CWE-89**  
**Corrección:** Parametrizar la query con `db.all("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], ...)`.

#### 6.3 Reflected XSS — `xssController.js`

```javascript
// VULNERABLE
const name = req.query.name || "";
res.send(`<p>Hola ${name}</p>`);
// Payload: ?name=<script>document.cookie</script>
```

**Severidad:** ALTA (CVSS 7.4) | **CWE-79**  
**Corrección:** `escapeHtml(name)` antes de la interpolación. La dependencia `escape-html` ya está instalada pero no se usa en la ruta vulnerable.

#### 6.4 Path Traversal — `fileController.js`

```javascript
// VULNERABLE
const filePath = "files/" + file;
// Payload: file = "../../etc/passwd"
```

**Severidad:** ALTA (CVSS 7.5) | **CWE-22**  
**Corrección:** Usar `path.resolve` y validar que la ruta resuelta comience por el directorio base.

#### 6.5 Sensitive Data Exposure — `apiController.js`

```javascript
// Expone contraseñas y números de tarjeta en texto plano
const users = [{ username: 'admin', password: 'password', creditCard: '4532-...' }];
res.json(users); // Devuelve TODO
```

**Severidad:** ALTA (CVSS 7.5) | **CWE-359**  
**Corrección:** Nunca almacenar contraseñas en claro (usar bcrypt). Nunca devolver campos sensibles en APIs. Filtrar la respuesta: solo `id` y `username`.

---

## 7. Ramas y comportamiento esperado

| Rama | Pipeline | Resultado | Motivo |
|------|----------|-----------|--------|
| `main-vulnerable` | `pipeline-vulnerable.yml` | ❌ **FALLA** | Trivy detecta CVEs CRITICAL/HIGH en dependencias desactualizadas. Semgrep detecta patrones de inyección. |
| `main-secure` | `pipeline-secure.yml` | ✅ **PASA** | Dependencias actualizadas, código sanitizado, imagen hardened. Sin CVEs con fix disponible. |

---

## 8. Cómo ejecutar localmente

### Requisitos

- Docker 24+
- Node.js 20+

### Construir y arrancar

```bash
# Construir imagen
docker build -t euvwa:local .

# Ejecutar
docker run -p 3000:3000 euvwa:local

# Verificar que corre como no-root
docker run --rm euvwa:local whoami
# Salida esperada: appuser
```

### Escanear localmente con Trivy

```bash
# Instalar Trivy
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh

# Escanear imagen
trivy image --severity CRITICAL,HIGH euvwa:local
```

### Generar SBOM localmente con Syft

```bash
# Instalar Syft
curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh -s -- -b /usr/local/bin

# Generar SBOM
syft euvwa:local -o cyclonedx-json=sbom.json
```

### Ejecutar DAST con ZAP (Docker)

```bash
# Arrancar la app en background
docker run -d --name euvwa -p 3000:3000 euvwa:local

# Ejecutar ZAP Baseline
docker run --rm --network host \
  -v $(pwd):/zap/wrk/:rw \
  ghcr.io/zaproxy/zaproxy:stable \
  zap-baseline.py -t http://localhost:3000 -r zap-report.html
```

---

## Propuestas de mejora

1. **Secrets Management**: Usar GitHub Secrets para inyectar variables sensibles en runtime. Para producción, integrar con HashiCorp Vault o AWS Secrets Manager.
2. **DAST Full Scan**: Pasar de `baseline` a `full-scan` en una etapa de staging para cobertura completa (más lento, más hallazgos).
3. **Notificaciones**: Webhooks a Slack/Teams al detectar vulnerabilidades críticas en producción.
4. **Policy as Code**: Definir umbrales de severidad aceptables con OPA (Open Policy Agent) para decisiones de go/no-go más granulares.
5. **Firma de imagen**: Usar Cosign (Sigstore) para firmar criptográficamente la imagen y verificar su integridad en el despliegue.

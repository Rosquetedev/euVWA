
# 1: builder — instala dependencias de producción

FROM node:20-alpine AS builder

WORKDIR /app

# Copiar solo manifiestos primero (mejor caché)
COPY package*.json ./

# Instalar SOLO dependencias de producción (sin devDependencies)
RUN npm ci --omit=dev


# 2: runtime — imagen final mínima

FROM node:20-alpine AS runtime

# Metadatos de seguridad
LABEL org.opencontainers.image.title="euVWA" \
      org.opencontainers.image.description="Universidad Europea Vulnerable Web App - SecDevOps Lab" \
      org.opencontainers.image.source="https://github.com/Rosquetedev/euVWA"

WORKDIR /app

# Crear usuario no-root antes de copiar archivos
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copiar dependencias desde builder
COPY --from=builder /app/node_modules ./node_modules

# Copiar código fuente
COPY app.js ./
COPY controllers/ ./controllers/
COPY routes/ ./routes/
COPY public/ ./public/
COPY files/ ./files/
COPY package.json ./

# Ajustar permisos: appuser solo necesita lectura/ejecución
RUN chown -R appuser:appgroup /app && chmod -R 550 /app

# Cambiar a usuario no-root
USER appuser

# Exponer puerto de la aplicación
EXPOSE 3000

# Healthcheck para orquestadores
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1

# Punto de entrada
CMD ["node", "app.js"]

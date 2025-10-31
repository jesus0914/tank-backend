# ========================
# 🏗️ Etapa 1: Build
# ========================
FROM node:20 AS builder
WORKDIR /app

# Copiar archivos base primero
COPY package*.json ./
COPY nest-cli.json ./
COPY tsconfig*.json ./

# Mostrar qué hay en /app
RUN echo "📦 Archivos base copiados:" && ls -la /app

# Instalar dependencias
RUN npm install

# Copiar el resto del código fuente, excepto lo ignorado
COPY . .

# Mostrar estructura antes de compilar
RUN echo "📂 Contenido antes del build:" && ls -la /app && ls -la /app/src || true

# Compilar el proyecto
RUN npm run build

# ========================
# 🚀 Etapa 2: Runtime
# ========================
FROM node:20-alpine AS production
WORKDIR /app

# Copiar solo lo necesario para ejecutar
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/tsconfig*.json ./
# Puerto por defecto
EXPOSE 3000

CMD npx prisma generate && node dist/src/main.js

# ========================
# 🏗️ Etapa 1: Build
# ========================
FROM node:20 AS builder
WORKDIR /app

# Copiar solo archivos necesarios para instalar dependencias
COPY package*.json ./
COPY nest-cli.json ./
COPY tsconfig*.json ./

# Instalar dependencias (usa npm ci si tienes package-lock.json)
RUN npm ci || npm install

# Copiar el resto del código fuente
COPY . .

# Compilar el proyecto (NestJS)
RUN npm run build

# ========================
# 🚀 Etapa 2: Runtime
# ========================
FROM node:20-alpine AS production
WORKDIR /app

# Copiar los artefactos necesarios desde la etapa de build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Exponer el puerto de la app
EXPOSE 3000

# Generar Prisma Client en base al DATABASE_URL del entorno
CMD npx prisma generate && node dist/src/main.js

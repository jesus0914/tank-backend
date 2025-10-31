# ========================
# 🏗️ Etapa 1: Build
# ========================
FROM node:20 AS builder
WORKDIR /app

# Copiar archivos base
COPY package*.json ./
COPY nest-cli.json ./
COPY tsconfig.json ./
COPY tsconfig.build.json ./

# Verificar visualmente los archivos
RUN echo "📦 Archivos en /app antes de npm install:" && ls -la /app

# Instalar dependencias
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Verificar antes de compilar
RUN echo "📂 Archivos antes del build:" && ls -la /app && ls -la /app/src || true

# Compilar el proyecto NestJS
RUN npm run build

# ========================
# 🚀 Etapa 2: Runtime
# ========================
FROM node:20-alpine AS production
WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD npx prisma generate && node dist/src/main.js

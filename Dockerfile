# ========================
# 🏗️ Etapa 1: Build
# ========================
FROM node:20 AS builder
WORKDIR /app

COPY package*.json ./
COPY nest-cli.json ./
COPY tsconfig*.json ./

# 🔍 Verifica que realmente los archivos se copien
RUN echo "📦 Archivos copiados a /app:" && ls -la /app

COPY . .

# 🔍 Verifica que el resto del código también llegó
RUN echo "📁 Contenido completo de /app:" && ls -la /app && ls -la /app/src || true

RUN npm install
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
